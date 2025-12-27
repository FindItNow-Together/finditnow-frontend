import useApi from "@/hooks/useApi";
import { User, UserRole } from "@/types/user";
import { Camera, User2 } from "lucide-react";
import { useState } from "react";
import UploadPhotoModal from "./UploadPhotoModal";

export default function ProfileSection({
  userData,
  setUserData,
}: {
  userData: User | undefined;
  setUserData: React.Dispatch<React.SetStateAction<User | undefined>>;
}) {
  const [showUploadPhotoModal, setShowUploadPhotoModal] = useState(false);
  const [userRole, setUserRole] = useState(userData?.role ?? "UNASSIGNED");
  const [error, setError] = useState("");

  const api = useApi();

  if (!userData?.email) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-6">
          <User2 className="h-8 w-8 text-gray-500 dark:text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Loading profile...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we load your information.
        </p>
      </div>
    );
  }

  const uploadProfilePhoto = async (file: File) => {
    if (!userData) return;
    const formData = new FormData();
    formData.append("domain", userData.role);
    formData.append("entityId", userData.id);
    formData.append("purpose", "profile");
    formData.append("file", file);

    const response = await api.post("/api/files/upload", formData);
    if (!response.ok) throw new Error("File upload failed");

    const data = await response.json();
    const res = await api.put(
      `/api/user/${userData.id}`,
      { ...userData, profileUrl: data.fileKey },
      { auth: "private" }
    );
    if (!res.ok) throw new Error("File sync failed with user");

    return data;
  };

  const handleUpdateProfile = async () => {
    const res = await api.put(
      `/api/user/${userData.id}`,
      { ...userData, role: userRole },
      {
        auth: "private",
      }
    );

    const data = await res.json();

    if (data.error) {
      console.log(data.error);
      return;
    }

    setUserData(data.data as User);
  };

  const handleUpdateRole = async () => {
    const res = await api.put("/api/auth/updaterole", { role: userRole }, { auth: "private" });

    if (res.status == 500) {
      setError("Something went wrong!, try again later");
    } else {
      setError("");
      setUserData((prev) => (prev ? { ...prev, role: userRole } : prev));
    }
  };

  return (
    <>
      <section>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Profile Settings
          </h2>

          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center mb-8">
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                {userData.profileUrl ? (
                  <img
                    src={process.env.NEXT_PUBLIC_IMAGE_GATEWAY_URL + userData.profileUrl}
                    alt="Profile"
                    className="h-28 w-28 lg:h-32 lg:w-32 rounded-2xl object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                  />
                ) : (
                  <div className="h-28 w-28 lg:h-32 lg:w-32 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-600">
                    <User2 className="h-14 w-14 lg:h-16 lg:w-16 text-gray-600 dark:text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowUploadPhotoModal(true)}
                  className="absolute -bottom-2 -right-2 h-10 w-10 bg-blue-600 hover:bg-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors duration-200"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Click camera to update photo
              </p>
            </div>

            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={userData.firstName}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    onChange={(e) =>
                      setUserData((prev) => (prev ? { ...prev, firstName: e.target.value } : prev))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={userData.email}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed opacity-60"
                    disabled
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  Cancel
                </button>
                <button
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={() => handleUpdateProfile()}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {showUploadPhotoModal && (
          <UploadPhotoModal
            onClose={() => setShowUploadPhotoModal(false)}
            onUpload={async (file) => {
              try {
                const res = await uploadProfilePhoto(file);
                setShowUploadPhotoModal(false);
                if (res.fileKey && userData) {
                  setUserData({ ...userData, profileUrl: res.fileKey });
                }
              } catch (err) {
                console.error(err);
              }
            }}
          />
        )}
      </section>
      <section className="mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Account Role
          </h3>

          {userData.role === "UNASSIGNED" ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your role carefully. This can be set only once.
              </p>

              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select role
                </option>
                <option value="CUSTOMER">Customer</option>
                <option value="DELIVERY_AGENT">Delivery Agent</option>
                <option value="SHOP">Shop Owner</option>
              </select>

              <button
                onClick={handleUpdateRole}
                disabled={!userRole}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition"
              >
                Confirm Role
              </button>

              {error && <div className={"bg-red-500"}>{error}</div>}
            </div>
          ) : (
            <div className="inline-flex items-center px-4 py-3 rounded-xl border border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                {userData.role.replace("_", " ")}
              </span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
