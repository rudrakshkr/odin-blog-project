import { Link } from "react-router";
import myPhoto from "../assets/images/my-photo.jpeg";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const About = ({user, setUser}) => {
    // States
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        if(toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage("");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const handleLogout = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/logout', { method: 'GET' });

        if (!res.ok) {
            throw new Error("Can't logout, please try again!");
        } else {
            localStorage.removeItem('jwtToken');
            setUser({ auth: false, name: '' });
            setToastMessage("You have successfully logged out!");
        }
    }

    const skills = [
        'JavaScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 
        'Prisma ORM', 'REST APIs', 'Tailwind CSS', 'GitHub', 'Linux'
    ];

    return (
        <div className="w-full min-h-screen flex flex-col bg-white">
            <nav className="w-full bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="flex flex-wrap items-center justify-between w-full max-w-6xl mx-auto px-4 py-3 sm:h-16 sm:py-0">
                    <div className="font-geist font-bold text-xl text-slate-900 tracking-tight order-1 shrink-0">
                        MyDevBlog
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 order-2 sm:order-3 shrink-0">
                        {user.auth ? (
                            <>
                                <p className="text-sm text-slate-700 hidden sm:block">
                                    Welcome <strong>{user.name}</strong>
                                </p>
                                <button 
                                    onClick={handleLogout}
                                    className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ): (
                            <Link 
                                to={"/login"}
                                className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                Log In
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-6 font-geist text-[14px] sm:text-[15px] font-medium text-slate-500 order-3 sm:order-2 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 sm:border-none">
                        <Link to="/profile" className="hover:text-slate-900 transition-colors">
                            Home
                        </Link>
                        <Link to="/about" className="text-indigo-600 font-semibold">
                            About
                        </Link>
                        <a href="https://github.com/rudrakshkr" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-indigo-100/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none"></div>

            <main className="w-full flex-1 pt-16 md:pt-24 px-4 pb-20">

                {/* Toast Notification  */}
                <div
                    className={cn(
                        "fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out",
                        toastMessage 
                            ? "opacity-100 translate-y-0" 
                            : "opacity-0 -translate-y-8 pointer-events-none"
                    )}
                >
                    <div className="flex items-center gap-3 bg-white border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-5 py-3 rounded-xl min-w-[300px]">
                        <div className="flex items-center justify-center size-8 bg-emerald-50 rounded-lg shrink-0">
                            <svg className="size-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        
                        <div className="flex flex-col gap-0.5">
                            <p className="text-[14px] font-bold text-slate-900 leading-none">Success</p>
                            <p className="text-[13px] font-medium text-slate-500 whitespace-nowrap">
                                {toastMessage}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-12">
                    {/* Intro  */}

                    <div className="relative group cursor-default mt-4">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500 group-hover:duration-200"></div>
                        <img 
                            className="relative w-40 h-40 rounded-full bg-white border-4 border-white shadow-xl text-indigo-600 flex items-center justify-center font-bold text-4xl transform group-hover:scale-105 transition-all duration-300"
                            src={myPhoto} 
                            alt="My profile photo" 
                        />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">Rudraksh Kumar</span>
                    </h1>

                    {/* Bio */}
                    <div className="text-lg text-slate-700 leading-relaxed font-geist space-y-6 max-w-2xl">
                        <p>
                            Hey! I'm a full-stack developer who just really enjoys building things for the web. For me, the best part of programming is taking a messy, complicated idea and turning it into something that's actually clean and easy for people to use.
                        </p>
                        <p>
                            Lately, I've been spending most of my time working with React, Node.js, and Express. I care a lot about writing clean code—not just to check off a "best practices" box, but because it honestly makes life so much easier for anyone jumping into the project later.
                        </p>
                        <p>
                            When I finally step away from the keyboard, I'm usually hunting down a good cup of coffee, or just catching up on whatever show I'm currently binge-watching. I'm always open to talking about web dev, sharing ideas, or just connecting with good people. Feel free to reach out!                        
                        </p>
                    </div>

                    {/* Skills Section */}
                    <section className="mt-10 pt-10 border-t border-slate-200 w-full flex flex-col items-center gap-10">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Skills
                        </h2>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {skills.map((tech, index) => (
                                <span 
                                    key={index} 
                                    className="px-6 py-2.5 bg-white/80 backdrop-blur-sm text-slate-600 text-sm font-semibold rounded-full border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 cursor-default"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Bottom Action Buttons (Centered row with filling/outlined style) */}
                    <section className="flex flex-col sm:flex-row flex-wrap gap-4 pt-8 w-full max-w-2xl justify-center">
                        {/* GitHub */}
                        <a 
                            href="https://github.com/rudrakshkr" 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 transition-all w-full sm:w-auto shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                            View my GitHub
                        </a>

                        {/* LinkedIn */}
                        <a 
                            href="https://www.linkedin.com/in/rudraksh-kumar2908" 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-[#0A66C2] font-semibold rounded-xl border border-slate-200 hover:bg-[#0A66C2]/5 hover:-translate-y-0.5 hover:border-[#0A66C2]/30 transition-all w-full sm:w-auto shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                            Connect
                        </a>

                        {/* Contact Me */}
                        <a 
                            href="mailto:rudrakshkumar2908@gmail.com" 
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5 transition-all w-full sm:w-auto shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                            Contact Me
                        </a>
                    </section>

                </div>
            </main>
        </div>
    )
}

export default About;