"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase/browser";

export function NavAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user)).catch(() => {});
  }, []);
  return loggedIn ? (
    <Link href="/dashboard" className="btn btn-primary btn-sm">Open dashboard</Link>
  ) : (
    <>
      <Link href="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">Log in</Link>
      <Link href="/login?mode=signup&next=/dashboard" className="btn btn-primary btn-sm">Start free</Link>
    </>
  );
}
