import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center bg-lime-50 dark:bg-stone-950 min-h-screen">
      <SignUp />
    </div>
  );
}
