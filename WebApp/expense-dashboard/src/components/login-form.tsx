import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = React.ComponentProps<"div"> & {
  emailProps?: React.InputHTMLAttributes<HTMLInputElement>;
  passwordProps?: React.InputHTMLAttributes<HTMLInputElement>;
  onFormSubmit?: React.FormEventHandler<HTMLElement>;
  loading?: boolean;
  error?: string | null;
};

export function LoginForm({
  className,
  emailProps,
  passwordProps,
  onFormSubmit,
  loading,
  error,
  ...props
}: LoginFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onFormSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  {...emailProps}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  {...passwordProps}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full !text-gray-900 hover:!bg-gray-200 focus:outline-none focus:ring-0 focus:border-transparent"
                  disabled={loading}
                  style={{
                    backgroundColor: "#f3f4f6", 
                    border: "none",
                  }}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
