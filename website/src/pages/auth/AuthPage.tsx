import { useEffect, useRef, useState } from "react";
import type { FormEvent, ClipboardEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBilling } from "../../context/BillingContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import {
  DesignIcon,
  DesignProvider,
  ErrorMessage,
  Notice,
  Select,
  Status,
} from "../../components/common/Design";
import type { DesignScreen } from "../../components/common/Design";
import type { UserRole } from "../../types/auth.types";
import seed from "../../data/demo.json";

export function AuthPage() {
  const auth = useAuth();
  const { profile, updateProfile } = useBilling();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState<UserRole>(
    params.get("role") === "customer" ? "customer" : "vendor",
  );
  const [step, setStep] = useState<"login" | "otp" | "register" | "business">(
    "login",
  );
  const [isNew, setNew] = useState(params.get("mode") === "register");
  // What the user typed (email or mobile); `email` is the resolved account email used for the OTP challenge.
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [destination, setDestination] = useState("");
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [digits, setDigits] = useState(seed.demoAuth.code.split(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendAt, setResendAt] = useState(0);
  const [clock, setClock] = useState(() => Date.now());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [account, setAccount] = useState({
    name: "Rohan Mehta",
    phone: seed.profile.phoneNumber,
  });
  const [business, setBusiness] = useState({
    ...profile,
    businessType: "Retail & trading",
  });
  const screen: DesignScreen =
    step === "login"
      ? "login"
      : step === "otp"
        ? "otp"
        : step === "register"
          ? "register"
          : "business";
  const remaining = Math.max(0, Math.ceil((resendAt - clock) / 1000));
  useEffect(() => {
    if (step !== "otp") return;
    refs.current[5]?.focus();
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [step]);
  async function request(register = isNew) {
    setBusy(true);
    setError("");
    try {
      let target = { role, email, channel, destination };
      // On the login step, resolve the typed email/mobile to an account; the role comes from the account.
      if (step === "login") {
        const value = identifier.trim();
        if (register) {
          if (!value.includes("@"))
            throw new Error(
              "Enter your email address to register your business.",
            );
          const address = value.toLowerCase();
          target = {
            role: "vendor",
            email: address,
            channel: "email",
            destination: address,
          };
        } else {
          target = await auth.findAccount(value);
        }
      }
      const result = await auth.requestOtp(target.email, target.role);
      setRole(target.role);
      auth.setRole(target.role);
      setEmail(target.email);
      setChannel(target.channel);
      setDestination(target.destination);
      setResendAt(result.resendAt);
      setClock(Date.now());
      setDigits(seed.demoAuth.code.split(""));
      setNew(register);
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to request code.");
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (step === "login") {
      await request();
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (step === "otp") {
        await auth.verifyOtp(email.trim().toLowerCase(), digits.join(""), role);
        if (isNew && role === "vendor") setStep("register");
        else
          navigate(role === "vendor" ? "/vendor" : "/customer", {
            replace: true,
          });
      }
      if (step === "register") {
        const [firstName, ...last] = account.name.trim().split(/\s+/);
        auth.updateUser({
          firstName,
          lastName: last.join(" "),
          phoneNumber: account.phone,
        });
        setStep("business");
      }
      if (step === "business") {
        const { businessType: _businessType, ...patch } = business;
        await updateProfile(patch);
        auth.updateUser({ businessName: business.businessName });
        navigate("/vendor", { replace: true });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  function paste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length < 2) return;
    e.preventDefault();
    setDigits(Array.from({ length: 6 }, (_, i) => text[i] || ""));
    refs.current[Math.min(text.length, 5)]?.focus();
  }
  const title =
    step === "otp"
      ? "OTP Verification"
      : step === "register"
        ? "Create account"
        : "Set up your business";
  return (
    <DesignProvider screen={screen}>
      <div
        className="auth-frame"
        data-figma-node={
          step === "login"
            ? "2:58267"
            : step === "otp"
              ? "2:58311"
              : step === "register"
                ? "2:58360"
                : "2:58402"
        }
      >
        <div className="device-status" aria-hidden="true">
          <span>9:41</span>
          <span>
            <DesignIcon name="imgIosSignal" />
            <DesignIcon name="imgIosWifiSignal" />
            <DesignIcon name="imgIosBatteryFull" />
          </span>
        </div>
        <header
          className={`mobile-header ${step === "login" ? "brand-header" : ""}`}
        >
          {step === "login" ? (
            <>
              <div className="brand">
                <span className="brand-mark">
                  <DesignIcon name="imgReceiptText" />
                </span>
                <span>Bill-Z</span>
              </div>
            </>
          ) : (
            <>
              <button
                className="back-button"
                aria-label="Go back"
                onClick={() => {
                  setError("");
                  setStep(step === "business" ? "register" : "login");
                }}
              >
                <DesignIcon name="imgArrowLeft" />
              </button>
              <div className="header-title">
                <h1>{title}</h1>
              </div>
            </>
          )}
        </header>
        <form className="auth-content" onSubmit={(e) => void submit(e)}>
          {step === "login" && (
            <div className="welcome" data-figma-node="2:58284">
              <div className="access-context">
                <span>WELCOME TO BILL-Z</span>
              </div>
              <h1 className="auth-heading">
                Welcome back.
                <br />
                Let’s get you in.
              </h1>
              <p className="auth-copy">
                One login for everyone. Use your registered email address or
                mobile number.
              </p>
            </div>
          )}
          {step === "otp" && (
            <div className="welcome">
              <div className="access-context">
                <DesignIcon name="imgStore" />
                <span>
                  {role === "vendor" ? "BUSINESS ACCESS" : "CUSTOMER ACCESS"}
                </span>
              </div>
              <h1 className="auth-heading">
                {channel === "sms" ? "Check your messages" : "Check your inbox"}
              </h1>
              <p className="auth-copy">
                {`We sent a 6-digit verification code to ${destination}.`}
              </p>
            </div>
          )}
          <ErrorMessage>{error}</ErrorMessage>
          {step === "login" && (
            <>
              <Input
                id="login-identifier"
                label="Email address or mobile number *"
                type="text"
                autoComplete="username"
                placeholder="Enter your email or mobile number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                rightIcon={<DesignIcon name="imgMail" />}
              />
              <Button
                type="submit"
                fullWidth
                isLoading={busy}
                leftIcon={<DesignIcon name="imgArrowRight" />}
              >
                Send login code
              </Button>
              <p className="auth-helper">
                We’ll send a one-time code by email or SMS.
              </p>
              <div className="auth-options">
                <hr />
                <p>Own a business? Get started here.</p>
                <Button
                  variant="outline"
                  fullWidth
                  type="button"
                  disabled={busy}
                  onClick={() => void request(true)}
                >
                  Register your business
                </Button>
              </div>
              <Notice icon="imgShieldCheck">
                Customers don’t sign up. Your business owner sends your access
                details by email or SMS.
              </Notice>
            </>
          )}
          {step === "otp" && (
            <>
              <label className="otp-label" htmlFor="otp-0">
                Verification code
              </label>
              <div className="otp-inputs">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    id={"otp-" + i}
                    ref={(element) => {
                      refs.current[i] = element;
                    }}
                    aria-label={"Verification code digit " + (i + 1)}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    pattern="[0-9]"
                    maxLength={1}
                    value={digit}
                    onPaste={paste}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(-1);
                      setDigits((d) =>
                        d.map((v, index) => (index === i ? value : v)),
                      );
                      if (value) refs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digits[i])
                        refs.current[i - 1]?.focus();
                      if (e.key === "ArrowLeft") refs.current[i - 1]?.focus();
                      if (e.key === "ArrowRight") refs.current[i + 1]?.focus();
                    }}
                    required
                  />
                ))}
              </div>
              <p className="otp-validity">Code is valid for 10 minutes.</p>
              <Button
                type="submit"
                fullWidth
                isLoading={busy}
                leftIcon={<DesignIcon name="imgArrowRight" />}
              >
                Verify
              </Button>
              <div className="resend-row">
                <span className="muted">Didn’t receive the code?</span>
                <button
                  className="text-link"
                  type="button"
                  onClick={() => void request()}
                  disabled={remaining > 0 || busy}
                >
                  {remaining > 0 ? `Resend in ${remaining}s` : "Resend OTP"}
                </button>
              </div>
              <button
                className="text-link"
                type="button"
                onClick={() => {
                  setStep("login");
                  setError("");
                }}
              >
                Change email or mobile number
              </button>
              <Notice icon="imgShieldCheck">
                For your security, never share this code with anyone.
              </Notice>
            </>
          )}
          {step === "register" && (
            <>
              <Status tone="blue">Step 1 of 2 · Your account</Status>
              <h1 className="onboarding-heading">
                A fresh start for
                <br />
                your business.
              </h1>
              <p className="auth-copy">
                A few details, then you’re ready to set up your business.
              </p>
              <Input
                label="Full name *"
                value={account.name}
                onChange={(e) =>
                  setAccount({ ...account, name: e.target.value })
                }
                autoComplete="name"
                required
              />
              <Input
                label="Email address *"
                value={email}
                readOnly
                rightIcon={<DesignIcon name="imgBadgeCheck" />}
                hint="Email verified"
              />
              <Input
                label="Mobile number *"
                type="tel"
                autoComplete="tel"
                value={account.phone}
                onChange={(e) =>
                  setAccount({ ...account, phone: e.target.value })
                }
                required
              />
              <Notice icon="imgShieldCheck">
                Your email is used for secure, password-free sign in.
              </Notice>
              <Button
                type="submit"
                fullWidth
                isLoading={busy}
                leftIcon={<DesignIcon name="imgArrowRight" />}
              >
                Continue
              </Button>
            </>
          )}
          {step === "business" && (
            <>
              <Status tone="blue">Step 2 of 2 · Business details</Status>
              <h1 className="onboarding-heading">
                Make it officially
                <br />
                yours.
              </h1>
              <p className="auth-copy">
                These details appear on every invoice. You can update them in
                settings.
              </p>
              <Input
                label="Business name *"
                value={business.businessName}
                onChange={(e) =>
                  setBusiness({ ...business, businessName: e.target.value })
                }
                required
              />
              <Select
                label="Business type"
                value={business.businessType}
                onChange={(e) =>
                  setBusiness({ ...business, businessType: e.target.value })
                }
              >
                {["Retail & trading", "Services", "Manufacturing", "Other"].map(
                  (s) => (
                    <option key={s}>{s}</option>
                  ),
                )}
              </Select>
              <Input
                label="GSTIN"
                value={business.gstin}
                maxLength={15}
                onChange={(e) =>
                  setBusiness({
                    ...business,
                    gstin: e.target.value.toUpperCase(),
                  })
                }
                hint="Registered in Gujarat · State code 24"
              />
              <Input
                label="Business address *"
                value={business.address}
                onChange={(e) =>
                  setBusiness({ ...business, address: e.target.value })
                }
                required
              />
              <div className="field-row">
                <Input
                  label="City"
                  value={business.city}
                  onChange={(e) =>
                    setBusiness({ ...business, city: e.target.value })
                  }
                />
                <Input
                  label="PIN code"
                  value={business.pincode}
                  onChange={(e) =>
                    setBusiness({ ...business, pincode: e.target.value })
                  }
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                />
              </div>
              <Select
                label="State"
                value={business.state}
                onChange={(e) =>
                  setBusiness({ ...business, state: e.target.value })
                }
              >
                {[
                  "Gujarat",
                  "Maharashtra",
                  "Rajasthan",
                  "Delhi",
                  "Karnataka",
                  "Tamil Nadu",
                  "Other",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
              <Notice icon="imgInfo">
                GST is split into CGST and SGST for sales within{" "}
                {business.state}.
              </Notice>
              <Button
                type="submit"
                fullWidth
                isLoading={busy}
                leftIcon={<DesignIcon name="imgArrowRight" />}
              >
                Save & Continue
              </Button>
            </>
          )}
          {step !== "business" && (
            <p className="legal">
              {step === "register" ? "By creating an account" : "By continuing"}
              , you agree to our Terms of Service and Privacy Policy.
            </p>
          )}
        </form>
      </div>
    </DesignProvider>
  );
}
