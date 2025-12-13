import AWS from "aws-sdk";

const ssm = new AWS.SSM({ region: "eu-north-1" });

export async function getOpenAIKey(): Promise<string> {
  const param = await ssm
    .getParameter({
      Name: "/testgenerator/OPENAI_API_KEY",
      WithDecryption: true,
    })
    .promise();

  return param.Parameter?.Value || "";
}
