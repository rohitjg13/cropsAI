// app/api/extract-amount/route.ts
import { extractTransactionAmount } from "../../all-sms/regex";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const amount = extractTransactionAmount(message);
    
    return new Response(JSON.stringify({ amount }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}