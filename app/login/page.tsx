function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400">
            <div className="bg-white w-full max-w-md p-10 rounded-xl shadow-xl flex flex-col space-y-8">

                <div className="text-center">
                    <h1 className="text-3xl font-semibold text-gray-800">FindItNow</h1>
                </div>

                <div className="flex flex-col space-y-4 text-gray-800">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                </div>

                <button className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-900 transition">
                    Login
                </button>

                <div className="text-center text-sm text-gray-600">
                    Don’t have an account?
                    <a className="text-black font-medium ml-2 cursor-pointer hover:underline" href={"/sign_up"}>
                        Sign up
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Login;