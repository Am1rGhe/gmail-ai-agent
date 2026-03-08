import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { InboxClient } from "./InboxClient";

export default async function InboxPage(){
    const session = await getServerSession(authOptions);
    // redirect to homepage if it fails 
    if(!session){
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                Inbox
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                You are signed in.
            </p>
            <div className="mt-6">
                <InboxClient />
            </div>
        </div>
    )

} 

