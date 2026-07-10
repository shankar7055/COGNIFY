"use client";
import MeshGradient from "./mesh-gradient";

export const AuthIllustration = () => {
  return (
    <div className="relative flex min-h-80 flex-col items-start justify-end overflow-hidden rounded-2xl bg-black p-4 md:p-8">


      <div className="absolute -top-48 -right-40 z-20 grid rotate-45 transform grid-cols-4 gap-32 mask-r-from-50%">
        <div className="size-40 shrink-0 rounded-3xl bg-neutral-900 shadow-[0px_2px_0px_0px_var(--color-neutral-600)_inset]"></div>
        <div className="size-40 shrink-0 rounded-3xl bg-neutral-900 shadow-[0px_2px_0px_0px_var(--color-neutral-600)_inset]"></div>
        <div className="size-40 shrink-0 rounded-3xl bg-neutral-900 shadow-[0px_2px_0px_0px_var(--color-neutral-600)_inset]"></div>
        <div className="size-40 shrink-0 rounded-3xl bg-neutral-900 shadow-[0px_2px_0px_0px_var(--color-neutral-600)_inset]"></div>
      </div>

      <div className="absolute -top-0 -right-10 z-20 grid rotate-45 transform grid-cols-4 gap-32 mask-r-from-50% opacity-50">
        <div className="size-40 shrink-0 rounded-3xl bg-neutral-900 shadow-[0px_2px_0px_0px_var(--color-neutral-600)_inset]"></div>
        <div className="size-40 shrink-0 rounded-3xl bg-neutral-900 shadow-[0px_2px_0px_0px_var(--color-neutral-600)_inset]"></div>
        <div className="size-40 shrink-0 rounded-3xl bg-neutral-900 shadow-[0px_2px_0px_0px_var(--color-neutral-600)_inset]"></div>
        <div className="size-40 shrink-0 rounded-3xl bg-neutral-900 shadow-[0px_2px_0px_0px_var(--color-neutral-600)_inset]"></div>
      </div>
      <MeshGradient className="absolute inset-0 z-30 h-full w-200 mask-t-from-50% blur-3xl" />

      {/* <div className="absolute -right-20 -bottom-20 h-100 w-100 rotate-45 transform bg-gradient-to-br from-pink-500 via-purple-500 to-violet-500 blur-[100px]" /> */}
    </div>
  );
};
