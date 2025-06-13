"use client";

import { TaskPayload, TaskSchema } from "@/schemas/task";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase-client";
import { Session } from "@supabase/supabase-js";

const TaskForm = ({ session }: { session: Session }) => {
  const logout = async () => {
    await supabase.auth.signOut();
  };

  const form = useForm<TaskPayload>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
    },
  });

  const uploadImage = async (
    file: File
  ): Promise<{ image_url: string; filePath: string } | null> => {
    const filePath = `test-${Date.now()}`;
    console.log(file);
    const { error } = await supabase.storage
      .from("task-images")
      .upload(filePath, file);

    if (error) {
      console.log(error);
      return null;
    }
    const { data } = await supabase.storage
      .from("task-images")
      .getPublicUrl(filePath);

    return { image_url: data.publicUrl, filePath };
  };
  const [isPending, startTransition] = useTransition();
  const onSubmit = async (values: TaskPayload) => {
    startTransition(async () => {
      let image = null;
      if (values.image) {
        image = await uploadImage(values.image);
      }
      const { error } = await supabase
        .from("tasks")
        .insert({
          title: values.title,
          description: values.description,
          email: session.user.email,
          ...image,
        })
        .select()
        .single();
      if (error) {
        console.log(error);
        return;
      }

      form.reset();
    });
  };
  return (
    <div className="space-y-3 max-w-[500px] w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground">Title</FormLabel>
                <div className="relative flex items-center">
                  <FormControl>
                    <Input
                      {...field}
                      className="py-5 placeholder:font-semibold px-4"
                      placeholder="Title"
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground">
                  Image Url
                </FormLabel>
                <div className="relative flex items-center">
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        field.onChange(file); // update react-hook-form value with the File object
                      }}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground">
                  Description
                </FormLabel>
                <div className="relative flex items-center">
                  <FormControl>
                    <Input
                      {...field}
                      className="py-5 placeholder:font-semibold px-4"
                      placeholder="Description"
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
          <Button disabled={isPending} className="w-full">
            Submit
          </Button>
        </form>
      </Form>

      <Button
        onClick={() => {
          logout();
        }}
        disabled={isPending}
        className="w-full"
      >
        Sign Out
      </Button>
    </div>
  );
};

export default TaskForm;
