import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../../lib/mongo";
import CvPaymentSubmissionModel from "../../../lib/models/cv-payment-submission";
import { NAIRAH_SERVICES, type NairahServiceId } from "../../../components/cv-review/nairah-services";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CreatePaymentSubmissionBody {
  readonly fullName?: unknown;
  readonly email?: unknown;
  readonly serviceId?: unknown;
  readonly paymentConfirmed?: unknown;
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

  const { fullName, email, serviceId, paymentConfirmed } = req.body as CreatePaymentSubmissionBody;
  const customerName = typeof fullName === "string" ? fullName.trim().replace(/\s+/g, " ") : "";
  const customerEmail = typeof email === "string" ? email.trim() : "";
  const selectedService = NAIRAH_SERVICES.find((service) => service.id === serviceId);

  if (customerName.length < 2 || customerName.length > 120) {
    res.status(400).json({ error: "Enter the full name used in InstaPay." });
    return;
  }
  if (!EMAIL_PATTERN.test(customerEmail) || customerEmail.length > 254) {
    res.status(400).json({ error: "Enter a valid email address." });
    return;
  }
  if (!selectedService || typeof serviceId !== "string") {
    res.status(400).json({ error: "Choose a valid service." });
    return;
  }
  if (paymentConfirmed !== true) {
    res.status(400).json({ error: "Confirm that the payment was sent." });
    return;
  }

  try {
    await connectMongo();

    const submission = await CvPaymentSubmissionModel.create({
      fullName: customerName,
      email: customerEmail,
      serviceId: serviceId as NairahServiceId,
      serviceTitle: selectedService.title,
      priceEgp: selectedService.priceEgp,
      paymentConfirmedAt: new Date(),
      status: "pending",
    });

    res.status(201).json({ id: submission._id.toString(), status: "pending" });
  } catch (error) {
    console.error("[cv-payments] failed to create submission:", error);
    res.status(500).json({ error: "Could not save your payment confirmation. Please try again." });
  }
}
