interface AuthFormProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

const AuthForm = ({
  title,
  subtitle,
  icon,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthFormProps) => (
  <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
    <div className="mb-8 text-center flex flex-col items-center">
      <div className="bg-blue-100 text-blue-600 p-3 rounded-xl mb-4">
        {icon}
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 text-sm max-w-sm">{subtitle}</p>
    </div>

    <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8">
      {children}
    </div>

    <div className="mt-6 text-sm text-gray-600">
      {footerText}{' '}
      <a href={footerLinkHref} className="text-blue-600 font-semibold hover:underline">
        {footerLinkText}
      </a>
    </div>
  </div>
);

export default AuthForm;