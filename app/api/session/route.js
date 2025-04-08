import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const session = (await supabase.auth.getSession()).data.session;
    const jwtToken = session?.access_token;

    if (jwtToken) {
        return new Response(JSON.stringify({ token: jwtToken }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } else {
        return new Response(JSON.stringify({ message: "JWT Token not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
        });
    }
}
