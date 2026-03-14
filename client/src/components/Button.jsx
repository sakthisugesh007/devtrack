const Button = ({
    children,
    variant = 'primary',
    className = "",
    icon: Icon,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40",
        secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm",
        danger: "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-lg shadow-red-500/20",
        ghost: "text-gray-400 hover:text-white hover:bg-white/5"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {Icon && <Icon className="w-5 h-5" />}
            <span>{children}</span>
        </button>
    );
};

export default Button;
