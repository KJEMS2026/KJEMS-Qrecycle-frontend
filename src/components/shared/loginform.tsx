import { createClient } from "@supabase/supabase-js";
export default function LoginForm() {
    const signIn = async () => {
        'use server';

        const supabase = (await createClient();

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "github",
        });

        if (error) {
            console.error("Error signing in:", error);
        }
    }

    

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <form className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-blue-500 text-white px-3 py-2 hover:bg-blue-600 transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  );
}