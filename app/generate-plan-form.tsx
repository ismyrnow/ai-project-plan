"use client";

import { useFormState, useFormStatus } from "react-dom";
import { generateProject } from "@/app/actions";

const initialState = {
  error: false,
  url: undefined,
};

export default function GeneratePlanForm() {
  const [state, formAction] = useFormState(generateProject, initialState);

  return (
    <form action={formAction}>
      <div className="mb-4">
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline min-h-32"
          id="description"
          name="description"
          placeholder="What kind of project do you want to plan?"
          autoFocus
          required
        />
      </div>
      <div className="flex items-center justify-between mb-4">
        <SubmitButton />
      </div>
      {state.error && (
        <p>Uh oh! Something went wrong generating your project.</p>
      )}
      {state.url && (
        <div>
          <p>
            Done! Download your project plan{" "}
            <a className="text-blue-600 underline" href={state.url}>
              here
            </a>
            .
          </p>
        </div>
      )}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
      type="submit"
      aria-disabled={pending}
    >
      {pending ? "Generating..." : "Generate Plan ✨"}
    </button>
  );
}
