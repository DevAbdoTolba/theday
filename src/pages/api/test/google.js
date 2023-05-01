import fetch from "node-fetch";

export default async function handler(req, res) {
  const response = await fetch("https://www.google.com");
  const html = await response.text();
  res.status(200).send(html);
}
