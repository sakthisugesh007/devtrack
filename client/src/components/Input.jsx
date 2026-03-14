import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const Input = ({
    label,
    type = 'text',
    placeholder,
    icon: Icon,
    error,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-300">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                )}
                <input
                    type={isPassword && showPassword ? 'text' : type}
                    className={`
            w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500/50 focus:border-red-500' : ''}
          `}
                    placeholder={placeholder}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-sm text-red-400 mt-1">{error}</p>
            )}
        </div>
    );
};

export default Input;
