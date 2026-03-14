import { Link } from 'react-router-dom';
import { Code2, Sparkles } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-[#0a0e27] flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2 mb-6 group">
                        <div className="relative">
                            <Code2 className="w-10 h-10 text-blue-500 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                            <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            DevTrack AI
                        </span>
                    </Link>
                    <h2 className="text-3xl font-bold text-white mb-2 font-outfit">{title}</h2>
                    <p className="text-gray-400">{subtitle}</p>
                </div>

                {children}

                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>
                        By continuing, you agree to our{' '}
                        <Link to="#" className="text-blue-400 hover:text-blue-300">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
