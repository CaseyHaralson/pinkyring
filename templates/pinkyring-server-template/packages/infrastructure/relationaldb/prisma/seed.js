const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await addEmilyDickinson();
  await addAlfredTennyson();
  await addCristinaRossetti();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

async function addEmilyDickinson() {
  const author = await prisma.author.upsert({
    where: {name: 'Emily Dickinson'},
    update: {},
    create: {
      name: 'Emily Dickinson',
    },
  });

  await prisma.blogPost.upsert({
    where: {
      authorId_title: {
        authorId: author.id,
        title: 'I taste a liquor never brewed',
      },
    },
    update: {},
    create: {
      authorId: author.id,
      title: 'I taste a liquor never brewed',
      text: `I taste a liquor never brewed – 
      From Tankards scooped in Pearl – 
      Not all the Frankfort Berries
      Yield such an Alcohol!
      
      Inebriate of air – am I – 
      And Debauchee of Dew – 
      Reeling – thro' endless summer days – 
      From inns of molten Blue – 
      
      When "Landlords" turn the drunken Bee
      Out of the Foxglove's door – 
      When Butterflies – renounce their "drams" – 
      I shall but drink the more!
      
      Till Seraphs swing their snowy Hats – 
      And Saints – to windows run – 
      To see the little Tippler
      Leaning against the – Sun!`,
    },
  });

  await prisma.blogPost.upsert({
    where: {
      authorId_title: {
        authorId: author.id,
        title: 'Success is counted sweetest',
      },
    },
    update: {},
    create: {
      authorId: author.id,
      title: 'Success is counted sweetest',
      text: `Success is counted sweetest
      By those who ne'er succeed.
      To comprehend a nectar
      Requires sorest need.
      
      Not one of all the purple Host
      Who took the Flag today
      Can tell the definition
      So clear of victory
      
      As he defeated – dying –
      On whose forbidden ear
      The distant strains of triumph
      Burst agonized and clear!`,
    },
  });
}

async function addAlfredTennyson() {
  const author = await prisma.author.upsert({
    where: {name: 'Alfred Lord Tennyson'},
    update: {},
    create: {
      name: 'Alfred Lord Tennyson',
    },
  });

  await prisma.blogPost.upsert({
    where: {
      authorId_title: {
        authorId: author.id,
        title: 'The Eagle',
      },
    },
    update: {},
    create: {
      authorId: author.id,
      title: 'The Eagle',
      text: `He clasps the crag with crooked hands;
      Close to the sun in lonely lands,
      Ring’d with the azure world, he stands.
      
      The wrinkled sea beneath him crawls;
      He watches from his mountain walls,
      And like a thunderbolt he falls.`,
    },
  });
}

async function addCristinaRossetti() {
  const author = await prisma.author.upsert({
    where: {name: 'Christina Rossetti'},
    update: {},
    create: {
      name: 'Christina Rossetti',
    },
  });

  await prisma.blogPost.upsert({
    where: {
      authorId_title: {
        authorId: author.id,
        title: 'One Sea-Side Grave',
      },
    },
    update: {},
    create: {
      authorId: author.id,
      title: 'One Sea-Side Grave',
      text: `Unmindful of the roses,
      Unmindful of the thorn,
      A reaper tired reposes
      Among his gathered corn:
      So might I, till the morn!
      
      Cold as the cold Decembers,
      Past as the days that set,
      While only one remembers
      And all the rest forget, –
      But one remembers yet.`,
    },
  });
}
