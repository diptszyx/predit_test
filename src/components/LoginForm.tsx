import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "./ui/utils";
import useAuthStore, { type LoginCredentials } from "../store/auth.store";

interface LoginFormProps {
  className?: string;
  onSuccess?: () => void;
}

type LoginFormValues = LoginCredentials;

export function LoginForm({ className, onSuccess }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const login = useAuthStore((state) => state.login);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user && onSuccess) {
      onSuccess();
    }
  }, [user, onSuccess]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
    } catch {
      // Errors are handled by the auth store state
    }
  };

  const handleFieldFocus = () => {
    if (error) {
      clearError();
    }
  };

  return (
    <div className={cn("w-full max-w-sm", className)}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            onChange={(e: any)=>{setValue('email',e.currentTarget.value)}}
            onFocus={handleFieldFocus}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            {...register("password")}
            onFocus={handleFieldFocus}
            onChange={(e: any)=>{setValue('password',e.currentTarget.value)}}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isAuthenticating}
        >
          {isAuthenticating ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

export default LoginForm;
