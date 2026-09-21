import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../../lib/mongo";
import CvPaymentSubmissionModel from "../../../lib/models/cv-payment-submission";
import { NAIRAH_SERVICES, type NairahServiceId } from "../../../components/cv-review/nairah-services";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CreatePaymentSubmissionBody {
  readonly email?: unknown;
  readonly phone?: unknown;
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

  const { email, phone, serviceId, paymentConfirmed } =
    req.body as CreatePaymentSubmissionBody;
  const contactEmail = typeof email === "string" ? email.trim() : "";
  const rawPhone = typeof phone === "string" ? phone.trim() : "";
  const phoneDigits = rawPhone.replace(/\D/g, "");
  const contactPhone = rawPhone.startsWith("+") ? `+${phoneDigits}` : phoneDigits;
  const selectedService = NAIRAH_SERVICES.find((service) => service.id === serviceId);

  if (!EMAIL_PATTERN.test(contactEmail) || contactEmail.length > 254) {
    res.status(400).json({ error: "Enter the same valid email used in the InstaPay note." });
    return;
  }
  if (phoneDigits.length < 8 || phoneDigits.length > 15) {
    res.status(400).json({ error: "Enter a valid phone number." });
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
      email: contactEmail,
      phone: contactPhone,
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
