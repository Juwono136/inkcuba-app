import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import NavBar from "../components/Navbar"; 
import Footer from "../components/Footer";

export default function App() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    program: "",
    agree: false,
  });
  const [justCreated, setJustCreated] = useState(false);

  const set = (k) => (e) =>
    setForm((s) => ({
      ...s,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!/^[^@]+@binus\.ac\.id$/i.test(form.email || "")) {
      e.email = "Use your BINUS email (@binus.ac.id).";
    }
    if ((form.password || "").length < 8) {
      e.password = "Password must be at least 8 characters.";
    }
    if (!form.program) e.program = "Please choose a program.";
    if (!form.agree) e.agree = "You must agree to the Terms and Privacy Policy.";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  function onSubmit(e) {
    e.preventDefault();
    setJustCreated(false);

    if (!isValid) {
      const first = errors[Object.keys(errors)[0]];
      toast.error(first || "Please complete all required fields.");
      return;
    }

    toast.success("Account successfully created!");
    setJustCreated(true);
    setForm({ name: "", email: "", password: "", program: "", agree: false });
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      {/* NavBar */}
      <NavBar />

      {/* Main */}
      <main className="container mx-auto px-4 py-10 flex-1">
        <h1 className="text-2xl font-semibold text-center">Create Account</h1>
        <p className="text-sm text-center opacity-70 mb-6">
          Start uploading your approved projects!
        </p>

        <form
          onSubmit={onSubmit}
          className="max-w-lg mx-auto bg-base-100 border border-base-300 rounded-xl shadow-sm p-8 space-y-6"
        >
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium">Full Name</label>
            <input
              className="input input-bordered input-ink w-full px-3"
              placeholder="Enter your full name"
              value={form.name}
              onChange={set("name")}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-sm font-medium">Email Address</label>
            <input
              type="email"
              className="input input-bordered input-ink w-full px-3"
              placeholder="name@binus.ac.id"
              value={form.email}
              onChange={set("email")}
            />
            <p className="text-xs text-base-content/60">Must be BINUS email</p>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="input input-bordered input-ink w-full px-3"
              placeholder="Create a strong password"
              value={form.password}
              onChange={set("password")}
            />
            <p className="text-xs text-base-content/60">
              Must be at least 8 characters long
            </p>
          </div>

          {/* Program */}
          <div className="space-y-1">
            <label className="block text-sm font-medium">Program</label>
            <select
              className="select select-bordered input-ink w-full px-3"
              value={form.program}
              onChange={set("program")}
            >
              <option value="">Choose a program</option>
              <option value="CSC">Computer Science (CSC)</option>
              <option valu="BIS">Business Information Systems (BIS)</option>
              <option value="GDNM">Graphic Design (GDNM)</option>
            </select>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm mt-0.5"
              checked={form.agree}
              onChange={set("agree")}
            />
            <p className="text-sm">
              I agree to the <a className="link">Terms of Service</a> and{" "}
              <a className="link">Privacy Policy</a>.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn w-full rounded-md py-2"
            style={{
              backgroundColor: "#000000",
              color: "#F5F5F5",
              borderColor: "#000000",
            }}
          >
            Create Account
          </button>

          {justCreated && (
            <p className="text-sm text-green-600 text-center">
              Account successfully created.
            </p>
          )}

          <p className="text-center text-sm">
            Already have an account? <a className="link">Sign in</a>
          </p>
        </form>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}