import React from "react";
import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import { Button, Input } from "../../components/ui";
import type { IChangePasswordModel } from "../../models/account";
import accountService from "../../services/account-service";
import { ChangePasswordValidationSchema } from "../../validation/account";

interface ChangePasswordFormProps {
  handleDialogClose: () => void;
}

const initialValues: IChangePasswordModel = {
  oldPassword: "",
  password: "",
  confirmPassword: "",
};

const ChangePassword: React.FC<ChangePasswordFormProps> = ({ handleDialogClose }) => {
  const handleSubmit = async (
    values: IChangePasswordModel,
    { setSubmitting, resetForm }: { setSubmitting: (v: boolean) => void; resetForm: () => void }
  ) => {
    try {
      const response = await accountService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.password,
      });
      if (response?.data?.success) {
        toast.success(response.data.message || "Password changed successfully");
        resetForm();
        handleDialogClose();
      } else {
        toast.error(response?.data?.message || "Failed to change password");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to change password";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={ChangePasswordValidationSchema}
      onSubmit={handleSubmit}
      validateOnBlur={true}
      validateOnChange={true}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-4">
          <Field
            name="oldPassword"
            label="Old Password"
            placeholder="Enter old password"
            type="password"
            isPasswordToggle={true}
            variant="bordered"
            radius="md"
            size="md"
            component={Input}
          />

          <Field
            name="password"
            label="New Password"
            placeholder="Enter new password"
            type="password"
            isPasswordToggle={true}
            variant="bordered"
            radius="md"
            size="md"
            component={Input}
          />

          <Field
            name="confirmPassword"
            label="Confirm New Password"
            placeholder="Re-enter new password"
            type="password"
            isPasswordToggle={true}
            variant="bordered"
            radius="md"
            size="md"
            component={Input}
          />

          {/* Footer Action Area */}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-default-100">
            <Button type="button" variant="bordered" color="danger" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button type="submit" variant="solid" color="primary" isLoading={isSubmitting}>
              Change Password
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ChangePassword;
