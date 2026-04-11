import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { TailSpin } from "react-loader-spinner";

const NewPost = ({user, setUser}) => {
    const token = localStorage.getItem("jwtToken");
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        postTitle: '', 
        postCoverImage: '', 
        postDescription: '',
        postStatus: 'draft',
        postCategory: '',
        postReadMin: 0,
        postTags: '',
        postUrl: '',
        postSummary: '',
        user: user
    })
    const [errors, setErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleChange = (e) => {
        const {name, value} = e.target;

        if(name === "postCoverImage") {
            const file = e.target.files[0];
            if(file) {
                const maxSizeInBytes = 10 * 1024 * 1024;

                if(file.size > maxSizeInBytes) {
                    setErrors("Image is too large! Please select a file smaller than 10MB.");

                    e.target.value = null;

                    window.scrollTo({top: 0, behavior: 'smooth'})

                    return;
                }

                setErrors("");
                const imagePreview = document.querySelector("#imagePreview");
                const addImage = document.querySelector("#addImage");

                imagePreview.style.display = "block";
                imagePreview.src = URL.createObjectURL(file);
                addImage.style.display = "none";

                setFormData(prevState => ({
                    ...prevState,
                    postCoverImage: file
                }))
            }
        }
        else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }))
        }
    }

    const handlePostSubmit = async (e) => {
        e.preventDefault();

        const content = formData.postDescription;
        if(!content || content.trim() === "" || content === "<p></p>") {
            alert("Please write some content for your post to submit!");
            return;
        }

        const submitData = new FormData();

        submitData.append('postTitle', formData.postTitle);
        submitData.append('postDescription', formData.postDescription);
        submitData.append('postStatus', formData.postStatus);
        submitData.append('postCategory', formData.postCategory);
        submitData.append('postReadMin', formData.postReadMin);
        submitData.append('postTags', formData.postTags);
        submitData.append('postUrl', formData.postUrl);
        submitData.append('postSummary', formData.postSummary);

        if(formData.postCoverImage) {
            submitData.append('postCoverImage', formData.postCoverImage);
        }

        try {
            setIsSubmitting(true);
            const res = await fetch('/api/submit-post', {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: submitData
            })

            if(res.status === 403 || res.status === 401) {
                console.error("Session expired. Logging out.");

                localStorage.removeItem('jwtToken');

                setUser({auth: false, name: null});

                navigate('/login', {
                    state: {successMessage: "Session expired! Please log in again."}
                })
                return;
            }

            if(!res.ok) {
                setErrors(["Something went wrong. Please try again."])
            }
            else {
                // Success
                // Redirect to Profile page
                navigate('/profile', {
                    state: {postSuccessMessage: "Post has been created!"}
                });
            }
        }
        catch(err) {
            console.error("Fetch error: ", err);
            setErrors(["Failed to connect to the server."])
        }
    }
    return (
        <div className="w-full min-h-screen flex flex-col">
            <nav className="w-full bg-white shadow-sm border-b border-slate-200 z-10 relative">
                <div className="flex justify-between items-center w-full max-w-6xl mx-auto px-4 pt-4">
                    
                    {/* Left Side: Navigation Links */}
                    <div className="flex gap-8 font-geist text-[#6f7279] font-semibold">
                        <Link to="/profile" className="pb-4 hover:text-slate-900 transition-colors">
                            Posts
                        </Link>
                        
                        <Link to="/new-post" className="pb-4 text-indigo-600 border-b-2 border-indigo-600">
                            New Post
                        </Link>
                        
                        <Link to="/comments" className="pb-4 hover:text-slate-900 transition-colors">
                            Comments
                        </Link>
                    </div>

                    {/* Right Side: User Info & Logout Button */}
                    <div className="flex items-center gap-6 pb-4">
                        <p className="text-md text-slate-700">
                            Welcome <strong>{user.name}</strong>
                        </p>
                        
                        <button 
                            onClick={handleLogout}
                            className="px-4 py-1.5 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                    
                </div>
            </nav>
            <main className="w-full flex-1 bg-[#f8fafc]">
                {errors.length !== 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
                        {errors}
                    </div>
                )}
                <form action="/api/submit-post" method="POST" className="flex flex-col lg:flex-row gap-10 w-full max-w-6xl mx-auto px-4 p-8" onSubmit={handlePostSubmit}>
                    {/* Left hand side  */}
                    <section className="flex flex-1 flex-col gap-8">
                        {/* Post title */}
                        <div>
                            <label htmlFor="postTitle"></label>
                            <input 
                                type="text" 
                                name="postTitle" 
                                id="postTitle" 
                                value={formData.postTitle}
                                onChange={handleChange}
                                maxLength={50}
                                placeholder="Post Title"
                                className="w-full px-0 py-3 text-3xl font-bold placeholder-slate-400 text-slate-900 border-b border-slate-200 focus:border-indigo-600 focus:outline-none transition-colors bg-transparent"
                                required
                            />
                            <p className="text-sm text-slate-500">Max 50 characters</p>
                        </div>
                        
                        {/* Cover Image */}
                        <div className="flex flex-col gap-2 w-full">
                            {/* Dash Box */}
                            <div className="flex justify-center relative px-6 py-16 border-2 border-dashed rounded-xl transition-all cursor-pointer bg-white border-slate-300 hover:border-slate-400">
                                <input 
                                    type="file" 
                                    name="postCoverImage" 
                                    id="postCoverImage"
                                    onChange={handleChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    accept="image/*"
                                    required
                                />
                                <img id="imagePreview" src="#" alt="your image" style={{display: "none"}} className="max-h-[400px] object-contain relative z-0 pointer-events-none"/>
                                <div id="addImage" className="flex flex-col justify-center items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image w-8 h-8 text-slate-400 mb-3" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                                    <p className="text-sm text-slate-500">Click or drag to upload cover image</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 ml-1">Max 10MB</p>
                            
                        </div>

                        {/* Post Description  */}
                        <div>
                            <Editor
                                    apiKey = {import.meta.env.VITE_Tiny_API_KEY}
                                    value={formData.postDescription}
                                    onEditorChange={(newContent) => {
                                        setFormData((prevData) => ({
                                            ...prevData,
                                            postDescription: newContent
                                        }));
                                    }}
                                    init={{
                                    plugins: [
                                        // Core editing features
                                        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                                        // Your account includes a free trial of TinyMCE premium features
                                        // Try the most popular premium features until Apr 19, 2026:
                                        'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'advtemplate', 'tinymceai', 'uploadcare', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown','importword', 'exportword', 'exportpdf'
                                    ],
                                    height: 500,
                                    menubar: false,
                                    branding: false,
                                    toolbar: 'undo redo | tinymceai-chat tinymceai-quickactions tinymceai-review | blocks fontfamily fontsize | bold italic underline strikethrough | link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                                    tinycomments_mode: 'embedded',
                                    tinycomments_author: 'Author name',
                                    mergetags_list: [
                                        { value: 'First.Name', title: 'First Name' },
                                        { value: 'Email', title: 'Email' },
                                    ],
                                    tinymceai_token_provider: async () => {
                                        await fetch(`https://demo.api.tiny.cloud/1/ivxbru2lavj7njc3t5fwp5kdevqp02tb1xdwn07pqrkh3g1u/auth/random`, { method: "POST", credentials: "include" });
                                        return { token: await fetch(`https://demo.api.tiny.cloud/1/ivxbru2lavj7njc3t5fwp5kdevqp02tb1xdwn07pqrkh3g1u/jwt/tinymceai`, { credentials: "include" }).then(r => r.text()) };
                                    },
                                    uploadcare_public_key: 'e5b639c656f8697f68b2',
                                    }}
                                initialValue="Enter your content here..."
                                />
                        </div>
                    </section>
                    
                    
                    {/* Right hand side  */}
                    <section className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4">
                        <div className="flex flex-col gap-5">
                            {/* Post status && Publish */}
                            <div className="p-6 border shadow-sm border-slate-200 rounded-lg bg-white">
                                <p className="font-bold text-[17px]">Publishing</p>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="postStatus" className="text-[14px] text-gray-700 pt-4 pb-2">Status</label>
                                    <select 
                                        name="postStatus" 
                                        id="postStatus" 
                                        value={formData.postStatus} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">

                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>

                                    </select>
                                </div>
                                <button 
                                    type="submit" 
                                    className="p-2 bg-[#4f39f6] hover:bg-blue-700 text-white w-full rounded-lg mt-4 font-semibold flex justify-center items-center gap-2 h-10 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && (
                                                <TailSpin
                                            visible={true}
                                            height="20"
                                            width="20"
                                            color="#ffffff"
                                            ariaLabel="tail-spin-loading"
                                            radius="1"
                                        />
                                    )}
                                    {isSubmitting ? "Publishing..." : "Publish"}
                                </button>
                            </div>

                            {/* Post Organisation  */}
                            <div className="p-6 border shadow-sm border-slate-200 rounded-lg bg-white">
                                <p className="font-bold text-[17px]">Organisation</p>
                                <div className="flex flex-col gap-1 mb-4">
                                    <label htmlFor="postCategory" className="text-[14px] text-gray-700 pt-4 pb-1">Category</label>
                                    <select 
                                        name="postCategory" 
                                        id="postCategory" 
                                        value={formData.postCategory}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                                        required>
                                        <option value="" disabled>Select Category</option>
                                        <option value="technology">Technology</option>
                                        <option value="design">Design</option>
                                        <option value="buisness">Buisness</option>
                                        <option value="lifestyle">Lifestyle</option>
                                    </select>
                                </div>

                                <div className="flex flex-col mb-1 gap-2">
                                    <label htmlFor="tags">Tags <span className="text-[13px] text-slate-500">(Max 30 characters)</span></label>
                                    <input 
                                        type="text" 
                                        name="postTags" 
                                        id="postTags" 
                                        value={formData.postTags}
                                        onChange={handleChange}
                                        maxLength={30}
                                        pattern="^[a-zA-Z0-9\s\.\-]+(?:,[a-zA-Z0-9\s\.\-]+)*$"
                                        title="Tags must be separated by commas (e.g., react, next.js, web-dev) and no special characters are allowed"
                                        placeholder="e.g. react,nextjs, web" 
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        required
                                    />
                                    <p className="text-[13px] text-gray-500 ml-2">Seperate with commas</p>
                                </div>

                                <div className="flex flex-col mb-1 gap-2">
                                    <label htmlFor="postReadMin">Read Time <span className="text-[13px] text-slate-500">(In Minutes)</span></label>
                                    <input 
                                        type="number"
                                        name="postReadMin" 
                                        id="postReadMin" 
                                        value={formData.postReadMin}
                                        onChange={handleChange}
                                        max={60}
                                        placeholder="5,10,15..." 
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        required
                                    />
                                    <p className="text-[13px] text-gray-500 ml-2">Max 60 min</p>
                                </div>
                            </div>
                            
                            {/* Post SEO  */}
                            <div className="p-6 border shadow-sm border-slate-200 rounded-lg bg-white">
                                <p className="font-bold text-[17px]">SEO</p>

                                <div className="flex flex-col gap-1 mb-4">
                                    <label htmlFor="postUrl" className="text-[14px] text-gray-700 pt-4 pb-1">URL Slug <span className="text-[13px] text-slate-500">(Max 15 characters)</span></label>
                                    <input 
                                        type="text" 
                                        name="postUrl" 
                                        id="postUrl" 
                                        value={formData.postUrl}
                                        onChange={handleChange}
                                        pattern="^[a-zA-Z0-9\-]+$"
                                        title="URL slug can only contain letters, numbers, and hyphens (no spaces or special characters)."
                                        maxLength={15}
                                        placeholder="place-url-slug"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1 mb-4">
                                    <label htmlFor="postSummary" className="text-[14px] text-gray-700 pt-4 pb-1">Excerpt / Summary <span className="text-[13px] text-slate-500">(Max 100 characters)</span></label>
                                    <textarea 
                                        type="text" 
                                        name="postSummary" 
                                        id="postSummary" 
                                        value={formData.postSummary}
                                        onChange={handleChange}
                                        placeholder="Brief summary for previews..."
                                        maxLength={100}
                                        rows={4}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none" 
                                        required
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </section>
                </form>
            </main>
        </div>
    )
}

export default NewPost;