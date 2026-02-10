import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@petcusher.app" },
    create: { email: "demo@petcusher.app", name: "Demo Tutor", locale: "pt-BR", region: "Brasil / SP" },
    update: {}
  });

  await prisma.pet.createMany({
    data: [
      {
        ownerId: user.id,
        displayName: "Thor",
        species: "Cachorro",
        breed: "Husky Siberiano",
        gender: "MALE",
        size: "LARGE",
        colors: ["Branco", "Cinza"],
        ageMonths: 11,
        pedigree: true,
        vaccinated: true,
        neutered: false,
        objective: "BREEDING",
        region: "Brasil / SP",
        about: "Energia alta, sociável, ama passeios. Procura fêmea para cruzamento responsável.",
        photos: [
          "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
          "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8",
          "https://images.unsplash.com/photo-1552053831-71594a27632d"
        ],
        videoUrl: "https://sample-videos.com/video321/mp4/240/big_buck_bunny_240p_1mb.mp4",
        isDonation: false
      },
      {
        ownerId: user.id,
        displayName: "Luna",
        species: "Gato",
        breed: "SRD (Caramelo?)",
        gender: "FEMALE",
        size: "SMALL",
        colors: ["Preto", "Branco"],
        ageMonths: 18,
        pedigree: false,
        vaccinated: true,
        neutered: true,
        objective: "COMPANIONSHIP",
        region: "Brasil / SP",
        about: "Adoção responsável. Muito carinhosa e acostumada com crianças.",
        photos: [
          "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
          "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13",
          "https://images.unsplash.com/photo-1592194996308-7b43878e84a6"
        ],
        videoUrl: null,
        isDonation: true
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
