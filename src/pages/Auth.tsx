
import { AuthForm } from "@/components/auth/AuthForm";

const Auth = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
