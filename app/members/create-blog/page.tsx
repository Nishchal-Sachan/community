import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/lib/user-auth";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { Container } from "@/components/ui/Container";
import BlogForm from "@/components/admin/BlogForm";

export default async function MembersCreateBlogPage() {
  const payload = await getUserFromCookie();

  if (!payload?.userId) {
    redirect("/login?next=/members/create-blog");
  }

  await connectDB();
  const user = await User.findById(payload.userId).lean();

  if (!user || user.role !== "member" || !user.isBlogger) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center bg-gray-50 p-4">
        <Container className="max-w-md text-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <h1 className="mb-2 text-xl font-semibold text-red-800">पहुंच अस्वीकृत</h1>
            <p className="text-sm font-medium text-red-600">आपको ब्लॉग लिखने की अनुमति नहीं है</p>
            <p className="mt-4 text-xs text-red-500">(You do not have permission to write a blog)</p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">नया ब्लॉग लिखें</h1>
          <p className="mb-8 text-sm text-gray-600">
            अपने विचार समुदाय के साथ साझा करें। आपके द्वारा सबमिट किए गए ब्लॉग को प्रकाशित होने से पहले एडमिन द्वारा जाँचा जाएगा।
          </p>

          <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
            <BlogForm
              mode="create"
              submitUrl="/api/members/blogs"
              redirectUrl="/members"
              uploadUrl="/api/members/blogs/upload"
            />
          </div>
        </div>
      </Container>
    </main>
  );
}
