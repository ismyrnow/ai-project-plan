import GeneratePlanForm from "./generate-plan-form";

export default function Home() {
  return (
    <main className="bg-gradient-to-r from-blue-400 to-purple-600 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="text-center lg:text-left lg:w-1/2">
            <h1 className="text-5xl font-bold text-white mb-4">
              AI Project Plan Creator
            </h1>
            <p className="text-white mb-8 text-xl">
              Create a project plan in seconds using AI.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg lg:w-1/3 mt-8 lg:mt-0">
            <GeneratePlanForm />
          </div>
        </div>
      </div>
    </main>
  );
}
