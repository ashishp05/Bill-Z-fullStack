import type { ColumnDef } from "@tanstack/react-table";
import { Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaEnvelope, FaPhone, FaSearch, FaStore, FaUser } from "react-icons/fa";
import { FiEye, FiRefreshCw, FiX } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { TanstackTable } from "../../components/custom-table/TanstackTable";
import {
  Avatar,
  Button,
  Chip,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Input,
  SelectDropdown,
  Switch,
} from "../../components/ui";
import type { Pagination } from "../../models/base-type";
import type { IVendorFilter, IVendorModal } from "../../models/vendor";
import { PAGINATION } from "../../shared/constants/pagination";
import { handleTableLoader } from "../../store/slices/generalSlice";
import vendorService from "../../services/vendor-service";

const initialFilter: IVendorFilter = {
  name: "",
  email: "",
  status: "",
};

const Vendors: React.FC = () => {
  const dispatch = useDispatch();
  const [vendorsList, setVendorsList] = useState<IVendorModal[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [pagination, setPagination] = useState<Pagination>(PAGINATION);
  const [filterValues, setFilterValues] = useState<IVendorFilter>(initialFilter);

  // Vendor Info Drawer State
  const [selectedVendor, setSelectedVendor] = useState<IVendorModal | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInfoLoading, setIsInfoLoading] = useState(false);

  const getVendors = useCallback(
    async (
      filter: IVendorFilter = filterValues,
      page: number = pagination.page,
      limit: number = pagination.limit
    ) => {
      dispatch(handleTableLoader(true));
      try {
        const skip = (page - 1) * limit;
        const params: Record<string, any> = {
          skip,
          limit,
          needCount: true,
          sortKey: "createdAt",
          sortOrder: "desc",
        };

        if (filter.name && filter.name.trim() !== "") {
          params.name = filter.name.trim();
        }
        if (filter.email && filter.email.trim() !== "") {
          params.email = filter.email.trim();
        }
        if (filter.status && filter.status !== "") {
          params.active = filter.status === "true";
        }

        const res = await vendorService.getAllVendors(params);
        const data = res?.data?.data as any;

        if (data) {
          const records: IVendorModal[] = Array.isArray(data.records)
            ? data.records
            : Array.isArray(data)
            ? data
            : [];
          const count = typeof data.total === "number" ? data.total : records.length;

          setVendorsList(records);
          setTotalRecords(count);
        } else {
          setVendorsList([]);
          setTotalRecords(0);
        }
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch vendors.";
        toast.error(errorMsg);
        setVendorsList([]);
        setTotalRecords(0);
      } finally {
        dispatch(handleTableLoader(false));
      }
    },
    [dispatch, filterValues, pagination.page, pagination.limit]
  );

  const debouncedSearch = useMemo(
    () =>
      debounce((filter: IVendorFilter, page: number, limit: number) => {
        getVendors(filter, page, limit);
      }, 400),
    [getVendors]
  );

  useEffect(() => {
    getVendors(initialFilter, 1, PAGINATION.limit);
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  const handleStatusToggle = useCallback(
    async (vendorId: string, newStatus: boolean) => {
      try {
        await vendorService.toggleVendorStatus(vendorId, { active: newStatus });
        toast.success(`Vendor ${newStatus ? "activated" : "deactivated"} successfully!`);
        setVendorsList((prev) =>
          prev.map((v) => (v.id === vendorId ? { ...v, active: newStatus } : v))
        );
        if (selectedVendor && selectedVendor.id === vendorId) {
          setSelectedVendor((prev) => (prev ? { ...prev, active: newStatus } : null));
        }
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update vendor status.";
        toast.error(errorMsg);
      }
    },
    [selectedVendor]
  );

  // Call Vendor Info API
  const handleViewVendorInfo = useCallback(async (vendor: IVendorModal) => {
    setSelectedVendor(vendor);
    setIsDrawerOpen(true);
    setIsInfoLoading(true);

    try {
      const res = await vendorService.getVendorById(vendor.id);
      const fetchedVendor = res?.data?.data as IVendorModal;
      if (fetchedVendor) {
        setSelectedVendor(fetchedVendor);
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load vendor details.";
      toast.error(errorMsg);
    } finally {
      setIsInfoLoading(false);
    }
  }, []);

  const handlePageChange = useCallback(
    (newPagination: Pagination) => {
      if (
        pagination.page !== newPagination.page ||
        pagination.limit !== newPagination.limit
      ) {
        setPagination(newPagination);
        getVendors(filterValues, newPagination.page, newPagination.limit);
      }
    },
    [pagination, filterValues, getVendors]
  );

  const columns: ColumnDef<IVendorModal>[] = useMemo(
    () => [
      {
        accessorKey: "firstName",
        header: "Vendor Name",
        enableSorting: true,
        cell: ({ row }) => {
          const v = row.original;
          const fullName = `${v.firstName || ""} ${v.lastName || ""}`.trim() || "Unknown Vendor";
          return (
            <div className="flex items-center gap-3">
              <Avatar
                size="md"
                src={v.profilePictureUrl || undefined}
                name={fullName}
                className="bg-primary/10 text-primary font-semibold"
              />
              <div>
                <p className="font-semibold text-foreground text-sm leading-tight">
                  {fullName}
                </p>
                <span className="text-[11px] text-default-400 font-mono">
                  ID: {v.id.substring(0, 8)}...
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "businessName",
        header: "Business / Store",
        enableSorting: true,
        cell: ({ row }) => {
          const bName = row.original.businessName;
          return bName ? (
            <div className="flex items-center gap-1.5 font-medium text-foreground text-sm">
              <FaStore className="text-primary w-3.5 h-3.5 shrink-0" />
              <span>{bName}</span>
            </div>
          ) : (
            <span className="text-default-400 italic text-xs">Not specified</span>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email Address",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-sm text-default-700">
            <FaEnvelope className="text-default-400 w-3 h-3 shrink-0" />
            <span>{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone Number",
        cell: ({ row }) => {
          const phone = row.original.phoneNumber || row.original.phone;
          const country = row.original.phoneCountry || "";
          return phone ? (
            <div className="flex items-center gap-1.5 text-sm text-default-700">
              <FaPhone className="text-default-400 w-3 h-3 shrink-0" />
              <span>
                {country} {phone}
              </span>
            </div>
          ) : (
            <span className="text-default-400 text-xs">-</span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Joined Date",
        enableSorting: true,
        cell: ({ row }) => {
          const val = row.original.createdAt || row.original._createdAt;
          if (!val) return <span className="text-default-400 text-xs">-</span>;
          const date = new Date(val);
          return (
            <span className="text-xs text-default-600">
              {isNaN(date.getTime())
                ? val
                : date.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
            </span>
          );
        },
      },
      {
        accessorKey: "active",
        header: "Status",
        meta: { align: "center" },
        cell: ({ row }) => {
          const isActive = row.original.active;
          return (
            <Chip
              variant="flat"
              color={isActive ? "success" : "danger"}
              size="sm"
            >
              {isActive ? "Active" : "Inactive"}
            </Chip>
          );
        },
      },
      {
        accessorKey: "statusToggle",
        header: "Toggle",
        meta: { align: "center" },
        cell: ({ row }) => {
          const isActive = row.original.active;
          const vendorId = row.original.id;
          return (
            <div className="flex items-center justify-center">
              <Switch
                size="sm"
                color="success"
                value={isActive}
                onChange={(checked) => {
                  if (vendorId) {
                    handleStatusToggle(vendorId, checked);
                  }
                }}
              />
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        meta: { align: "center" },
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Button
              isIconOnly
              size="sm"
              radius="full"
              variant="light"
              color="primary"
              title="View Vendor Info"
              onClick={() => handleViewVendorInfo(row.original)}
            >
              <FiEye className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        ),
      },
    ],
    [handleStatusToggle, handleViewVendorInfo]
  );

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-sm text-default-500">
            View, filter, and inspect registered store vendors and merchant accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="flat"
            color="primary"
            size="sm"
            startContent={<FiRefreshCw className="w-4 h-4" />}
            onClick={() => getVendors(filterValues, pagination.page, pagination.limit)}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar with Name and Email Filters */}
      <Formik
        initialValues={initialFilter}
        onSubmit={(data: IVendorFilter) => {
          setPagination((prev) => ({ ...prev, page: 1 }));
          setFilterValues(data);
          getVendors(data, 1, pagination.limit);
        }}
        enableReinitialize
        onReset={() => {
          setPagination((prev) => ({ ...prev, page: 1 }));
          setFilterValues(initialFilter);
          getVendors(initialFilter, 1, pagination.limit);
        }}
      >
        {(props) => {
          const { handleSubmit, handleReset, setFieldValue } = props;
          return (
            <Form onSubmit={handleSubmit} noValidate>
              <div className="p-4 rounded-2xl bg-content1 border border-divider shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name Filter */}
                  <Field
                    name="name"
                    placeholder="Filter by vendor name or business"
                    component={Input}
                    startContent={<FaSearch className="w-4 h-4 text-default-400" />}
                    onChange={(e: any) => {
                      const value = e?.target ? e.target.value : e;
                      setFieldValue("name", value);
                      const newFilter = { ...filterValues, name: value };
                      setFilterValues(newFilter);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                      debouncedSearch(newFilter, 1, pagination.limit);
                    }}
                    isClearable={true}
                  />

                  {/* Email Filter */}
                  <Field
                    name="email"
                    placeholder="Filter by email address"
                    component={Input}
                    startContent={<FaEnvelope className="w-4 h-4 text-default-400" />}
                    onChange={(e: any) => {
                      const value = e?.target ? e.target.value : e;
                      setFieldValue("email", value);
                      const newFilter = { ...filterValues, email: value };
                      setFilterValues(newFilter);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                      debouncedSearch(newFilter, 1, pagination.limit);
                    }}
                    isClearable={true}
                  />

                  {/* Status Filter */}
                  <Field
                    name="status"
                    placeholder="Select status"
                    component={SelectDropdown}
                    options={[
                      { label: "All Status", value: "" },
                      { label: "Active", value: "true" },
                      { label: "Inactive", value: "false" },
                    ]}
                    isClearable={true}
                    onChange={(option: any) => {
                      const value = option ? option.value : "";
                      setFieldValue("status", value);
                      const newFilter = { ...filterValues, status: value };
                      setFilterValues(newFilter);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                      getVendors(newFilter, 1, pagination.limit);
                    }}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-divider">
                  <Button
                    type="button"
                    variant="flat"
                    color="default"
                    size="sm"
                    onClick={handleReset}
                  >
                    Reset Filters
                  </Button>
                  <Button
                    type="submit"
                    variant="solid"
                    color="primary"
                    size="sm"
                  >
                    Apply Filter
                  </Button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>

      {/* Tanstack Table for Vendors */}
      <TanstackTable
        data={vendorsList}
        columns={columns}
        pagination={pagination}
        onPaginationChange={handlePageChange}
        enableCheckbox={false}
        enableSorting
        defaultSortKey="createdAt"
        defaultSortOrder="desc"
        totalCount={totalRecords}
      />

      {/* Vendor Information Slide-over Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        placement="right"
        size="md"
        backdrop="blur"
      >
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between border-b border-divider pb-3">
            <div className="flex items-center gap-2">
              <FaStore className="text-primary w-5 h-5" />
              <span className="text-lg font-bold text-foreground">
                Vendor Profile & Info
              </span>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={() => setIsDrawerOpen(false)}
            >
              <FiX className="w-5 h-5 text-default-500" />
            </Button>
          </DrawerHeader>

          <DrawerBody className="space-y-6 py-6">
            {isInfoLoading ? (
              <div className="py-16 text-center text-default-400">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">Fetching vendor profile from API...</p>
              </div>
            ) : selectedVendor ? (
              <>
                {/* Hero Header Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-content2 to-content1 border border-divider text-center relative overflow-hidden">
                  <Avatar
                    size="lg"
                    src={selectedVendor.profilePictureUrl || undefined}
                    name={`${selectedVendor.firstName} ${selectedVendor.lastName}`}
                    className="w-20 h-20 mx-auto text-xl font-bold bg-primary text-white shadow-lg ring-4 ring-background mb-3"
                  />
                  <h2 className="text-lg font-bold text-foreground">
                    {selectedVendor.firstName} {selectedVendor.lastName}
                  </h2>
                  <p className="text-sm text-default-500 mt-0.5">
                    {selectedVendor.businessName || "Registered Merchant"}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <Chip
                      variant="flat"
                      color={selectedVendor.active ? "success" : "danger"}
                      size="sm"
                    >
                      {selectedVendor.active ? "Active Merchant" : "Inactive / Suspended"}
                    </Chip>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-default-400">
                    Contact & Identification
                  </h3>

                  <div className="p-3.5 rounded-xl bg-content2/50 border border-divider flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FaUser className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-default-400">Full Name</p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedVendor.firstName} {selectedVendor.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-content2/50 border border-divider flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FaEnvelope className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-default-400">Email Address</p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedVendor.email}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-content2/50 border border-divider flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FaPhone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-default-400">Phone Number</p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedVendor.phoneCountry || ""}{" "}
                        {selectedVendor.phoneNumber || selectedVendor.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-content2/50 border border-divider flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FaStore className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-default-400">Store / Business Name</p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedVendor.businessName || "Not set"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-default-400">
                    Account Timestamps
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-content2/40 border border-divider">
                      <span className="text-[11px] text-default-400 block">Joined Date</span>
                      <span className="text-xs font-medium text-foreground mt-0.5 block">
                        {selectedVendor.createdAt
                          ? new Date(selectedVendor.createdAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-content2/40 border border-divider">
                      <span className="text-[11px] text-default-400 block">Last Updated</span>
                      <span className="text-xs font-medium text-foreground mt-0.5 block">
                        {selectedVendor.updatedAt
                          ? new Date(selectedVendor.updatedAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Status Toggle */}
                <div className="p-4 rounded-xl bg-content2 border border-divider flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Account Status</p>
                    <p className="text-xs text-default-500">
                      Toggle to immediately grant or restrict vendor access
                    </p>
                  </div>
                  <Switch
                    size="md"
                    color="success"
                    value={selectedVendor.active}
                    onChange={(checked) => handleStatusToggle(selectedVendor.id, checked)}
                  />
                </div>
              </>
            ) : null}
          </DrawerBody>

          <DrawerFooter className="border-t border-divider flex justify-end gap-2">
            <Button
              variant="flat"
              color="default"
              onClick={() => setIsDrawerOpen(false)}
            >
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </section>
  );
};

export default Vendors;
