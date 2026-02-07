const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { v4 } = require("uuid");
const prisma = new PrismaClient();

async function main() {
  const settings = [
    { label: "multi_user_mode", value: "true" },
    { label: "logo_filename", value: "anything-llm.png" },
  ];

  for (let setting of settings) {
    const existing = await prisma.system_settings.findUnique({
      where: { label: setting.label },
    });

    // Only create the setting if it doesn't already exist
    if (!existing) {
      await prisma.system_settings.create({
        data: setting,
      });
    }
  }

  // Auto-create admin user if no admin exists
  const existingAdmin = await prisma.users.findFirst({
    where: { role: "admin" },
  });

  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error(
        "ADMIN_PASSWORD environment variable is required to create the initial admin user."
      );
      process.exit(1);
    }

    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    await prisma.users.create({
      data: {
        username: "admin",
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log("Admin user created successfully with username: admin");
  }

  // Ensure JWT_SECRET is set
  if (!process.env.JWT_SECRET) {
    const jwtSecret = v4();
    process.env.JWT_SECRET = jwtSecret;
    console.log(
      "JWT_SECRET was not set. Generated a new one. Please set JWT_SECRET in your .env file for persistence."
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
