import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { requireAdmin, sendError } from "../../../lib/auth-middleware";
import ClassModel from "../../../lib/models/class";
import SubjectChangeRequestModel from "../../../lib/models/subject-change-request";

interface FlattenedSubject {
  name: string;
  abbreviation: string;
  shared: boolean;
  semesterIndex: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (req.method === "GET") {
      const { user } = await requireAdmin(req);

      const classId = req.query.classId;
      if (!classId || typeof classId !== "string") {
        return sendError(res, 400, "Missing required query parameter: classId");
      }

      if (user.assignedClassId !== classId) {
        return sendError(res, 403, "Admin not assigned to this class");
      }

      const classDoc = await ClassModel.findById(classId);
      if (!classDoc) {
        return sendError(res, 404, "Class not found");
      }

      const subjects: FlattenedSubject[] = [];
      for (const entry of classDoc.data) {
        for (const subject of entry.subjects) {
          subjects.push({
            name: subject.name,
            abbreviation: subject.abbreviation,
            shared: subject.shared ?? false,
            semesterIndex: entry.index,
          });
        }
      }

      // TTL cleanup: delete rejected requests older than 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      await SubjectChangeRequestModel.deleteMany({
        classId: new mongoose.Types.ObjectId(classId),
        status: "rejected",
        updatedAt: { $lt: sevenDaysAgo },
      });

      const pendingChanges = await SubjectChangeRequestModel.find({
        classId: new mongoose.Types.ObjectId(classId),
        status: { $in: ["pending", "rejected"] },
      }).sort({ createdAt: -1 });

      return res.status(200).json({ className: classDoc.class, subjects, pendingChanges });
    }

    if (req.method === "POST") {
      const { user } = await requireAdmin(req);

      const {
        classId,
        changeType,
        subjectName,
        subjectAbbreviation,
        shared,
        semesterIndex,
        originalSubjectName,
      } = req.body as {
        classId: string;
        changeType: string;
        subjectName: string;
        subjectAbbreviation: string;
        shared?: boolean;
        semesterIndex: number;
        originalSubjectName?: string;
      };

      if (!classId || !changeType || !subjectName || !subjectAbbreviation || semesterIndex == null) {
        return sendError(res, 400, "Missing required fields");
      }

      if (!["create", "edit", "delete"].includes(changeType)) {
        return sendError(res, 400, "Invalid changeType");
      }

      if ((changeType === "edit" || changeType === "delete") && !originalSubjectName) {
        return sendError(res, 400, "originalSubjectName required for edit/delete");
      }

      if (user.assignedClassId !== classId) {
        return sendError(res, 403, "Admin not assigned to this class");
      }

      // Check subject name uniqueness within the class for create/edit
      if (changeType === "create" || changeType === "edit") {
        const classDoc = await ClassModel.findById(classId);
        if (!classDoc) return sendError(res, 404, "Class not found");

        const nameExists = classDoc.data.some((entry) =>
          entry.subjects.some(
            (s) =>
              s.name.toLowerCase() === subjectName.toLowerCase() &&
              (changeType === "create" || s.name !== originalSubjectName)
          )
        );

        if (nameExists && !shared) {
          return sendError(res, 400, "Subject name already exists in this class");
        }
      }

      const created = await SubjectChangeRequestModel.create({
        classId: new mongoose.Types.ObjectId(classId),
        changeType,
        subjectName,
        subjectAbbreviation,
        shared: shared ?? false,
        semesterIndex,
        originalSubjectName: originalSubjectName ?? undefined,
        status: "pending",
        requestedBy: user.firebaseUid,
      });

      return res.status(201).json(created);
    }

    if (req.method === "PUT") {
      const { user } = await requireAdmin(req);

      const id = req.query.id;
      if (!id || typeof id !== "string") {
        return sendError(res, 400, "Missing required query parameter: id");
      }

      const changeRequest = await SubjectChangeRequestModel.findById(id);
      if (!changeRequest) return sendError(res, 404, "Change request not found");

      if (changeRequest.requestedBy !== user.firebaseUid) {
        return sendError(res, 403, "Not the requesting admin");
      }
      if (changeRequest.status !== "pending") {
        return sendError(res, 403, "Change request is not pending");
      }

      const { subjectName, subjectAbbreviation, shared, semesterIndex } =
        req.body as {
          subjectName?: string;
          subjectAbbreviation?: string;
          shared?: boolean;
          semesterIndex?: number;
        };

      if (subjectName !== undefined) changeRequest.subjectName = subjectName;
      if (subjectAbbreviation !== undefined) changeRequest.subjectAbbreviation = subjectAbbreviation;
      if (shared !== undefined) changeRequest.shared = shared;
      if (semesterIndex !== undefined) changeRequest.semesterIndex = semesterIndex;

      await changeRequest.save();
      return res.status(200).json(changeRequest);
    }

    if (req.method === "DELETE") {
      const { user } = await requireAdmin(req);

      const id = req.query.id;
      if (!id || typeof id !== "string") {
        return sendError(res, 400, "Missing required query parameter: id");
      }

      const changeRequest = await SubjectChangeRequestModel.findById(id);
      if (!changeRequest) return sendError(res, 404, "Change request not found");

      if (changeRequest.requestedBy !== user.firebaseUid) {
        return sendError(res, 403, "Not the requesting admin");
      }
      if (changeRequest.status !== "pending") {
        return sendError(res, 403, "Change request is not pending");
      }

      await changeRequest.deleteOne();
      return res.status(200).json({ deleted: true });
    }

    return sendError(res, 405, "Method not allowed");
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") return sendError(res, 401, "Unauthorized");
    if (message === "Forbidden") return sendError(res, 403, "Forbidden");
    console.error("[admin/subjects] unexpected error:", error);
    return sendError(res, 500, "Internal server error");
  }
}
