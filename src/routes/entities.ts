import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { authenticate, AuthenticatedRequest } from "../middleware/authenticate";

const router = Router();

router.get("/", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAdmin) return res.status(403).send("Forbidden");

    const page = parseInt(req.query.page as string) || 1;
    const take = 10;
    const skip = (page - 1) * take;

    const [entities, total] = await Promise.all([
        prisma.entities.findMany({
            skip,
            take,
            orderBy: { createdAt: "desc" },
        }),
        prisma.entities.count(),
    ]);

    res.status(200).json({entities, total});
});

router.get("/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const entityId = Number(req.params.id);

    const entity = await prisma.entities.findUnique({
        where: {
            id: entityId
        }
    });
    res.status(201).json(entity);
});

router.post("/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const { name } = req.body;

    if (!req.isAdmin) return res.status(403);

    await prisma.entities.create({
        data: { name },
    });
    res.status(201).json({ message: "Entity created" });
});

router.put("/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const { name } = req.body;
    const entityId = Number(req.params.id);

    if (!req.isAdmin) return res.status(403);

    const entity = await prisma.entities.findUnique({
        where: {
            id: entityId
        }
    });

    if (!entity) return;

    await prisma.entities.update({
        data: { name },
        where: {
            id: entityId
        }
    });
    res.status(201).json({ message: "Entity updated" });
});

router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
    const entityId = Number(req.params.id);

    if (!req.isAdmin) return res.status(403);

    await prisma.entities.delete({
        where: {
            id: entityId
        }
    });
    res.status(201).json({ message: "Entity deleted" });
});

export default router;