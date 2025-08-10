import AdminRegisterForm from '@/components/AdminRegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <AdminRegisterForm />
      </div>
    </div>
  );
}
