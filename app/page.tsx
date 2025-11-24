export default function Home() {
    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-200 to-gray-400">
            <div className={"text-center text-3xl text-gray-800 font-black"}><span
                className={"animate-pulse"}>Hi</span>,
                <a
                className={"ml-5 cursor-pointer hover:underline text-blue-500"} href={"/login"}>Login</a>
            </div>
        </div>
    );
}
