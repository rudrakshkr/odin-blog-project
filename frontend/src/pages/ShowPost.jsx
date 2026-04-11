import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ThreeDots } from "react-loader-spinner";
import DOMPurify from 'dompurify';

const ShowPost = ({user}) => {
    const token = localStorage.getItem("jwtToken");
    const {postSlug} = useParams();

    // States
    const [formData, setFormData] = useState({
        postTitle: '', 
        postDescription: '',
        postStatus: 'draft',
        postCategory: '',
        postReadMin: 0,
        postTags: '',
        postUrl: '',
        postSummary: '',
        postAuthor: '',
        postDate: '',
    })
    const [errors, setErrors] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    console.log(user)

    useEffect(() => {
        const getPost = async () => {
            try {
                const res = await fetch(`/api/${postSlug}/getPostBySlug`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })

                const data = await res.json();

                const rawDate = data.post.date;

                const [day, month, year] = rawDate.split('/');

                const dateObj = new Date(year, month - 1, day);

                const formattedDate = dateObj.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });

                if(!res.ok) {
                    setErrors("Failed to get posts. ");
                }
                
                setFormData({
                    postTitle: data.post.title || '',
                    postDescription: data.post.description || '',
                    postStatus: data.post.status || 'draft',
                    postCategory: data.post.category || '',
                    postReadMin: data.post.readMin || 0,
                    postTags: data.post.tags || '',
                    postUrl: data.post.urlSlug || '',
                    postSummary: data.post.summary || '',
                    postDate: formattedDate || ''
                });
                
                
                if(data.post.userId) {
                    const getUser = await fetch(`/api/${data.post.userId}/getUserById`, {
                        method: 'GET',
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        }
                    })

                    const getUserData = await getUser.json();

                    if(!data) {
                        setErrors("Failed to get user");
                    }

                    setFormData(prevData => ({
                        ...prevData,
                        ["postAuthor"]: getUserData.user.username
                    }))
                }
                
            }
            catch(err) {
                console.error("Failed to fetch post", err);
            }
            finally {
                setIsLoading(false);
            }
        }

        getPost();
    }, [token])

    const handleLogout = async (e) => {
        e.preventDefault(e)
        const res = await fetch('/api/logout', {
            method: 'GET'
        })

        if(!res.ok) {
            throw new Error("Can't logout, please try again!")
        }
        else {
            localStorage.removeItem('jwtToken');
            setUser({auth: false, name: ''})
        }
    }

    return (
        <div className="w-full min-h-screen flex flex-col">
            <nav className="w-full bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="flex justify-between items-center w-full max-w-6xl mx-auto px-4 h-16">
                    
                    {/* Left Side: Header & Navigation */}
                    <div className="flex items-center gap-8">
                        <div className="font-geist font-bold text-xl text-slate-900 tracking-tight">
                            MyDevBlog
                        </div>

                        {/* Navigation Links */}
                        <div className="flex items-center gap-6 font-geist text-[15px] font-medium text-slate-500">
                            <Link to="/profile" className="hover:text-slate-900 transition-colors">
                                Home
                            </Link>
                            <Link to="/new-post" className="hover:text-slate-900 transition-colors">
                                About
                            </Link>
                            <a href="https://github.com/newbbiecoder" target="_blank" className="hover:text-slate-900 transition-colors">
                                GitHub
                            </a>
                        </div>
                    </div>

                    {/* Right Side: User Info & Logout */}
                    <div className="flex items-center gap-5">         
                        {user.name && (
                            <div className="hidden sm:flex items-center gap-1.5 font-geist">
                                <span className="text-sm text-slate-500">Welcome,</span>
                                <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                            </div>
                        )}

                        <div className="hidden sm:block h-5 w-px bg-slate-200"></div>
                        
                        {/* Logout Button */}
                        <button 
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="w-full flex flex-col flex-1 bg-[#f8fafc]">
                {isLoading ? (
                    <div className="flex flex-1 justify-center items-center">
                        <ThreeDots
                            visible={true}
                            height="150"
                            width="150"
                            color="#4fa94d"
                            radius="9"
                            ariaLabel="three-dots-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                        />
                    </div>
                ): (
                    <>
                        {errors && (
                            <div className="p-4 m-4 max-w-3xl mx-auto w-full bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
                                {errors}
                            </div>
                        )}

                        {formData && (
                            <article className="w-full max-w-3xl mx-auto px-6 py-12 md:py-12">
                                
                                {/* Header Section */}
                                <header className="mb-8">
                                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                                        {formData.postTitle || "Post Title"}
                                    </h1>
                                    <div className="flex flex-col text-[15px] font-medium text-slate-600 gap-0.5">
                                        <span className="text-slate-900 font-semibold">{formData.postAuthor || "Alex Developer"}</span>
                                        <span className="text-slate-500">{formData.postDate || "March 15, 2024"}</span>
                                    </div>
                                </header>

                                <hr className="border-slate-200 mb-10" />

                                {/* Content Section */}
                                <div 
                                    className="text-lg text-slate-800 leading-relaxed font-geist
                                            [&_p]:mb-6 
                                            [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-12 [&_h2]:mb-6
                                            [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-8 [&_h3]:mb-4
                                            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul>li]:mb-2
                                            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol>li]:mb-2
                                            [&_a]:text-indigo-600 [&_a]:underline [&_a]:underline-offset-4
                                            [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600"
                                    dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(formData.postDescription)}} 
                                />

                                <hr className="border-slate-200 mt-12 mb-12" />

                                {/* Comment Section */}
                                <section className="pb-10">
                                    <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">Leave a Comment</h2>
                                    
                                    <form className="flex flex-col gap-5 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60">
                                        
                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="name" className="text-sm font-semibold text-slate-700 ml-1">Name</label>
                                            <input 
                                                type="text" 
                                                id="name" 
                                                name="name"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-slate-900"
                                                placeholder="Your Name"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="comment" className="text-sm font-semibold text-slate-700 ml-1">Comment</label>
                                            <textarea 
                                                id="comment" 
                                                name="comment"
                                                rows="5" 
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all resize-y text-slate-900"
                                                placeholder="What are your thoughts?"
                                                required
                                            ></textarea>
                                        </div>

                                        <button 
                                            type="submit" 
                                            className="mt-2 px-8 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all w-full md:w-auto md:self-start shadow-sm"
                                        >
                                            Post Comment
                                        </button>

                                    </form>
                                </section>

                            </article>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

export default ShowPost;