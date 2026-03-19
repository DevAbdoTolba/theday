import { NextApiRequest, NextApiResponse } from "next";
import { requireSuperAdmin, sendError } from "../../../lib/auth-middleware";
import SubjectChangeRequestModel, {
  ISubjectChangeRequest,
} from "../../../lib/models/subject-change-request";
import ClassModel from "../../../lib/models/class";
import UserModel from "../../../lib/models/user";
import ContentItemModel from "../../../lib/models/content-item";
import mongoose from "mongoose";

interface PendingApproval {
  _id: string;
  classId: string;
  className: string;
  changeType: "create" | "edit" | "delete";
  subjectName: string;
  subjectAbbreviation: string;
  shared: boolean;
  semesterIndex: number;
  originalSubjectName?: string;
  originalSubjectAbbreviation?: string;
  requestedBy: string;
  requestedByName: string;
  requestedByEmail: string;
  createdAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (req.method === "GET") {
      await requireSuperAdmin(req);

      const pendingRequests = await SubjectChangeRequestModel.find({
        status: "pending",
      }).sort({ createdAt: -1 });

      // Collect unique classIds and requestedBy UIDs for batch loading
      const classIds = Array.from(
        new Set(pendingRequests.map((r) => r.classId.toString()))
      );
      const requestedByUids = Array.from(
        new Set(pendingRequests.map((r) => r.requestedBy))
      );

      // Batch-load classes
      const classes = await ClassModel.find({
        _id: {
          $in: classIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      });
      const classMap = new Map(
        classes.map((c) => [c._id.toString(), c.class])
      );

      // Batch-load users by firebaseUid
      const users = await UserModel.find({
        firebaseUid: { $in: requestedByUids },
      });
      const userMap = new Map(
        users.map((u) => [
          u.firebaseUid,
          { displayName: u.displayName, email: u.email },
        ])
      );

      const pending: PendingApproval[] = pendingRequests.map(
        (r: mongoose.HydratedDocument<ISubjectChangeRequest>) => {
          const userInfo = userMap.get(r.requestedBy);
          const result: PendingApproval = {
            _id: (r._id as mongoose.Types.ObjectId).toString(),
            classId: r.classId.toString(),
            className: classMap.get(r.classId.toString()) ?? "Unknown",
            changeType: r.changeType,
            subjectName: r.subjectName,
            subjectAbbreviation: r.subjectAbbreviation,
            shared: r.shared,
            semesterIndex: r.semesterIndex,
            requestedBy: r.requestedBy,
            requestedByName: userInfo?.displayName ?? "Unknown",
            requestedByEmail: userInfo?.email ?? "Unknown",
            createdAt: r.createdAt.toISOString(),
          };
          if (r.originalSubjectName !== undefined) {
            result.originalSubjectName = r.originalSubjectName;
          }
          if (r.originalSubjectAbbreviation !== undefined) {
            result.originalSubjectAbbreviation = r.originalSubjectAbbreviation;
          }
          return result;
        }
      );

      return res.status(200).json({ pending, count: pending.length });
    }

    if (req.method === "POST") {
      const { user } = await requireSuperAdmin(req);

      const { changeRequestId, action } = req.body as {
        changeRequestId: string;
        action: string;
      };

      if (!changeRequestId || !action) {
        return sendError(res, 400, "Missing required fields: changeRequestId, action");
      }
      if (action !== "approve" && action !== "reject") {
        return sendError(res, 400, "Invalid action — must be 'approve' or 'reject'");
      }

      const changeRequest = await SubjectChangeRequestModel.findById(changeRequestId);
      if (!changeRequest || changeRequest.status !== "pending") {
        return sendError(res, 404, "Change request not found or not pending");
      }

      if (action === "reject") {
        changeRequest.status = "rejected";
        changeRequest.reviewedBy = user.firebaseUid;
        changeRequest.reviewedAt = new Date();
        await changeRequest.save();
        return res.status(200).json({ action: "rejected", changeRequestId });
      }

      // action === "approve"
      const classDoc = await ClassModel.findById(changeRequest.classId);
      if (!classDoc) {
        return sendError(res, 404, "Class not found for this change request");
      }

      const semIdx = changeRequest.semesterIndex;

      if (changeRequest.changeType === "create") {
        // Find or create the semester entry
        let semester = classDoc.data.find((d) => d.index === semIdx);
        if (!semester) {
          classDoc.data.push({ index: semIdx, subjects: [] });
          semester = classDoc.data[classDoc.data.length - 1];
        }
        semester.subjects.push({
          name: changeRequest.subjectName,
          abbreviation: changeRequest.subjectAbbreviation,
          shared: changeRequest.shared,
        });
        await classDoc.save();
      }

      if (changeRequest.changeType === "edit") {
        // Find the original subject and update it
        for (const entry of classDoc.data) {
          const subjectIndex = entry.subjects.findIndex(
            (s) => s.name === changeRequest.originalSubjectName
          );
          if (subjectIndex !== -1) {
            entry.subjects[subjectIndex].name = changeRequest.subjectName;
            entry.subjects[subjectIndex].abbreviation = changeRequest.subjectAbbreviation;
            entry.subjects[subjectIndex].shared = changeRequest.shared;
            break;
          }
        }
        await classDoc.save();
      }

      if (changeRequest.changeType === "delete") {
        // Remove subject from class
        for (const entry of classDoc.data) {
          const subjectIndex = entry.subjects.findIndex(
            (s) => s.name === changeRequest.originalSubjectName
          );
          if (subjectIndex !== -1) {
            entry.subjects.splice(subjectIndex, 1);
            break;
          }
        }
        await classDoc.save();

        // Delete associated content items for this subject only
        const deletedAbbr =
          changeRequest.originalSubjectAbbreviation ??
          changeRequest.subjectAbbreviation;
        await ContentItemModel.deleteMany({
          classId: changeRequest.classId,
          category: deletedAbbr,
        });
      }

      // Delete the approved change request (it's been applied)
      await changeRequest.deleteOne();

      return res.status(200).json({ action: "approved", changeRequestId });
    }

    return sendError(res, 405, "Method not allowed");
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") return sendError(res, 401, "Unauthorized");
    if (message === "Forbidden") return sendError(res, 403, "Forbidden");
    console.error("[sudo/approvals] unexpected error:", error);
    return sendError(res, 500, "Internal server error");
  }
}
