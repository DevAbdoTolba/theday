import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../../lib/mongo";
import CvPaymentSubmissionModel from "../../../lib/models/cv-payment-submission";
import { NAIRAH_SERVICES, type NairahServiceId } from "../../../components/cv-review/nairah-services";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CreatePaymentSubmissionBody {
  readonly name?: unknown;
  readonly email?: unknown;
  readonly serviceId?: unknown;
  readonly paymentNoteConfirmed?: unknown;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name, email, serviceId, paymentNoteConfirmed } =
    req.body as CreatePaymentSubmissionBody;
  const fullName = typeof name === "string" ? name.trim() : "";
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const selectedService = NAIRAH_SERVICES.find((service) => service.id === serviceId);

  if (fullName.length < 2 || fullName.length > 100) {
    res.status(400).json({ error: "Enter your full name." });
    return;
  }
  if (!EMAIL_PATTERN.test(normalizedEmail) || normalizedEmail.length > 254) {
    res.status(400).json({ error: "Enter a valid email address." });
    return;
  }
  if (!selectedService || typeof serviceId !== "string") {
    res.status(400).json({ error: "Choose a valid service." });
    return;
  }
  if (paymentNoteConfirmed !== true) {
    res.status(400).json({ error: "Confirm that your email is in the payment message." });
    return;
  }

  try {
    await connectMongo();

    const recentPending = await CvPaymentSubmissionModel.findOne({
      email: normalizedEmail,
      serviceId,
      status: "pending",
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    }).lean();
    if (recentPending) {
      res.status(409).json({ error: "A payment confirmation for this service is already waiting for review." });
      return;
    }

    const submission = await CvPaymentSubmissionModel.create({
      fullName,
      email: normalizedEmail,
      serviceId: serviceId as NairahServiceId,
      serviceTitle: selectedService.title,
      priceEgp: selectedService.priceEgp,
      paymentNoteConfirmedAt: new Date(),
      status: "pending",
    });

    res.status(201).json({ id: submission._id.toString(), status: "pending" });
  } catch (error) {
    console.error("[cv-payments] failed to create submission:", error);
    res.status(500).json({ error: "Could not save your payment confirmation. Please try again." });
  }
}
