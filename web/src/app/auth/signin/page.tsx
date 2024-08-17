"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const SignIn = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  console.log(callbackUrl);

  useEffect(() => {
    router.replace(callbackUrl ?? "/student/login");
    // if (callbackUrl?.includes("admin")) {
    //   router.replace("/admin/login");
    // } else {
    //   router.replace("/student/login");
    // }
  }, [callbackUrl, router]);

  return <div>Redirecting...</div>;
};

export default SignIn;
