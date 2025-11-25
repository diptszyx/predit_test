import { useForm } from "react-hook-form";

import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { cn } from "./ui/utils";
import { Input } from "./ui/input";

export interface CreateMarketValues {
  email: string;
  password: string;
}

export default function CreateMarketPage() {
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
    setValue,
  } = useForm<CreateMarketValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: CreateMarketValues) => {
    console.log('data', data)
  }

  return <div className="min-h-screen bg-background">
    <div className="max-w-2xl p-4 lg:p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-left mb-2 text-[40px]">
          Create Market
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      // noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email", { required: "required" })}
            onChange={(e: any) => { setValue('email', e.currentTarget.value); clearErrors("email") }}
          />
          {errors.email && (
            <p className="text-sm text-amber-600">Email is required</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register("password", { required: "required" })}
            onChange={(e: any) => { setValue('password', e.currentTarget.value); clearErrors("password") }}
          />
          {errors.password && (
            <p className="text-sm text-amber-600">Password is required</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
        >
          {/* {isAuthenticating ? "Signing in..." : "Sign in"} */}
          Create
        </Button>
      </form>



      {/* <form onSubmit={handleSubmit((data) => console.log("data", data))}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email', { required: true })} className="border" />
        {errors.email && <p>Email is required.</p>}
        <input {...register('password')} className="border" />
        <input type="submit" />
      </form> */}
    </div >
  </div >
}