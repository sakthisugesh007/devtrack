import { Github, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { API_URL } from '../api';
import Button from '../components/Button';
import Card from '../components/Card';

const ConnectAccount = () => {
    const navigate = useNavigate();
    return (
        <AuthLayout
            title="Connect Your GitHub"
            subtitle="Unlock AI-powered insights for your development workflow"
        >
            <Card className="p-8 backdrop-blur-xl bg-white/[0.03] border-white/10 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-xl">
                    <Github className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2 font-outfit">Sync Your Repositories</h3>
                <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                    We need access to your GitHub commit history to analyze your productivity trends.
                </p>

                <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-start space-x-3 text-sm text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>Read-only access to public repositories</span>
                    </li>
                    <li className="flex items-start space-x-3 text-sm text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>Secure OAuth 2.0 authentication</span>
                    </li>
                    <li className="flex items-start space-x-3 text-sm text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>No code modification rights requested</span>
                    </li>
                </ul>

                <a href={`${API_URL}/api/auth/github`} className="block w-full">
                    <Button variant="primary" className="w-full justify-center group text-lg py-4" icon={Github}>
                        Connect GitHub Account
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </a>

                <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start space-x-3 text-left">
                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-200 leading-relaxed">
                        Your privacy is our priority. We only analyze metadata and never store your actual source code.
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Skip for now →
                    </button>
                </div>
            </Card>
        </AuthLayout>
    );
};

export default ConnectAccount;
