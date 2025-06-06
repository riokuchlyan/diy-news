import { getOpenAIResponse } from "@/utils/getOpenAIResponse";

export default async function Test() {
  const response = await getOpenAIResponse("USA");
  return <div>{response}</div>;
}