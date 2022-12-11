# https://github.com/aws-samples/prisma-lambda-cdk

# FROM node:16-alpine as build
FROM public.ecr.aws/lambda/nodejs:18 as build
WORKDIR /build
# COPY serverless/dbmigration/package-lock.json serverless/dbmigration/package.json ./
COPY package-lock.json package.json ./
RUN npm ci
# COPY serverless/dbmigration/migration-runner.ts .
COPY migration-runner.ts .


# https://esbuild.github.io/api/
# also refer to: https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/aws-lambda-nodejs/lib/bundling.ts
RUN npx esbuild migration-runner.ts --bundle --outdir=dist --platform=node --external:@prisma/client


# FROM node:16-alpine
# WORKDIR /lambdataskroot
FROM public.ecr.aws/lambda/nodejs:18
WORKDIR ${LAMBDA_TASK_ROOT}

# COPY serverless/dbmigration/package-lock.json serverless/dbmigration/package.json ./
COPY package-lock.json package.json ./
# COPY packages/infrastructure/relationaldb/prisma ./prisma
COPY ./prisma ./prisma
RUN npm ci --production
COPY --from=build /build/dist .

# CMD cat
CMD ["migration-runner.handler"]
