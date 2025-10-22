import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { checkEncryptedPassword, encryptPassword } from "../utils/auth";
import { authenticate, AuthenticatedRequest } from "../middleware/authenticate";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email or password is missing" });
    }

    await prisma.user.create({
      data: { name, email, password, is_admin: false },
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error when trying to create user" });
  }
});

router.get("/", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.isAdmin) return res.status(403);
  const users = await prisma.user.findMany({
    select: {
      name: true,
      email: true,
      created_at: true,
    }
  });
  res.status(201).json(users);
});

router.get("/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.params.id);

  if (userId !== req.authenticatedUserId && !req.isAdmin) return res.status(403);

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  res.status(201).json(user);
});

router.put("/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, currentPassword, newPassword } = req.body;
  const userId = Number(req.params.id);

  if (userId !== req.authenticatedUserId && !req.isAdmin) return res.status(403);

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) return;

  const emailAlreadyExists = await prisma.user.findFirst({
    where: {
      email,
      id: {
        not: userId,
      }
    }
  });

  if (emailAlreadyExists) res.status(403).json({ message: "Email already exists" });

  // only verify if the password match if the user is not admin
  if (!req.isAdmin) {
    const match = await checkEncryptedPassword(currentPassword, user?.password);
    if (!match) res.status(403).json({ message: "Current password is incorrect" });
  }

  await prisma.user.update({
    data: {
      name,
      email,
      password: await encryptPassword(newPassword)
    },
    where: {
      id: userId
    }
  });
  res.status(201).json({ message: "User updated" });
});

router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.params.id);

  if (userId !== req.authenticatedUserId && !req.isAdmin) return res.status(403);

  await prisma.user.delete({
    where: {
      id: userId
    }
  });
  res.status(201).json({ message: "User deleted" });
});

export default router;