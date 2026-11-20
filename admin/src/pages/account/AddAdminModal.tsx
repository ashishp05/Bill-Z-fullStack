import React from "react";
import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import { Button, Input, Modal } from "../../components/ui";
import type { IAddAdminRequestModel } from "../../models/account";
import accountService from "../../services/account-service";
import { AddAdminValidationSchema } from "../../validation/account";

interface AddAdminModalProps {
  openDialog: boolean;
  handleDialogClose: () => void;
  onAdminAdded?: () => void;
}

const initialValues: IAddAdminRequestModel = {
  name: "",
  email: "",
  password: "",
};

const AddAdminModal: React.FC<AddAdminModalProps> = ({
  openDialog,
  handleDialogClose,
  onAdminAdded,
}) => {
  const handleSubmit = async (
    values: IAddAdminRequestModel,
    { setSubmitting, resetForm }: { setSubmitting: (v: boolean) => void; resetForm: () => void }
  ) => {
    try {
      const response = await accountService.addAdmin(values);
      if (response?.data?.success) {
        toast.success(response.data.message || "Admin created successfully");
        resetForm();
        handleDialogClose();
        if (onAdminAdded) {
          onAdminAdded();
        }
      } else {
        toast.error(response?.data?.message || "Failed to create admin");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to create admin";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      openDialog={openDialog}
      handleDialogClose={handleDialogClose}
      title="Add New Administrator"
      isDismissable={true}
      isKeyboardDismissDisabled={false}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={AddAdminValidationSchema}
        onSubmit={handleSubmit}
        validateOnBlur={true}
        validateOnChange={true}
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-4">
            <Field
              name="name"
              label="Full Name"
              placeholder="e.g. John Doe"
              variant="bordered"
              radius="md"
              size="md"
              component={Input}
            />

            <Field
              name="email"
              type="email"
              label="Email Address"
              placeholder="admin@example.com"
              variant="bordered"
              radius="md"
              size="md"
              component={Input}
            />

            <Field
              name="password"
              type="password"
              label="Password"
              placeholder="Minimum 8 characters"
              isPasswordToggle={true}
              variant="bordered"
              radius="md"
              size="md"
              component={Input}
            />

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-default-100">
              <Button
                type="button"
                variant="bordered"
                color="danger"
                onClick={handleDialogClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="solid"
                color="primary"
                isLoading={isSubmitting}
              >
                Create Admin
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default AddAdminModal;
