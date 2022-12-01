# prisma needs open ssl 1.1.x and some docker images are moving to open ssl 3
# https://github.com/prisma/prisma/issues/16553#issuecomment-1353302617
# https://github.com/prisma/prisma/issues/14073#issuecomment-1351560775
FROM node:18.12.1-alpine3.16

CMD npm run start