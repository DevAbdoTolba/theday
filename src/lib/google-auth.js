const credentials = {
  client_email: process.env.CLIENT_EMAIL,
  private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

export const getAuthClient = () => {
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
};