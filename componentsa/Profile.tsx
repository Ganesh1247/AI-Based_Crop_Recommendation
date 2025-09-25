import { useState } from "react";
import { ArrowLeft, User, MapPin, Crop, Settings, History, Bell, Shield, HelpCircle, Edit, Save, X, Plus, Trash2, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAuth } from "../lib/context/AuthContext";
import { useLanguage } from "../lib/context/LanguageContext";

interface ProfileProps {
  onBack: () => void;
}

interface FarmDetails {
  farmName: string;
  farmSize: string;
  soilType: string;
  irrigationType: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  crops: Array<{
    id: string;
    name: string;
    variety: string;
    plantedDate: string;
    expectedHarvest: string;
    area: string;
    status: string;
  }>;
}

interface Preferences {
  language: string;
  notifications: {
    weather: boolean;
    cropAlerts: boolean;
    marketPrices: boolean;
    diseaseWarnings: boolean;
  };
  units: {
    temperature: string;
    area: string;
    weight: string;
  };
}

export function Profile({ onBack }: ProfileProps) {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - in real app this would come from backend
  const [farmDetails, setFarmDetails] = useState<FarmDetails>({
    farmName: user?.name ? `${user.name}'s Farm` : "My Farm",
    farmSize: "5.2",
    soilType: "Loamy",
    irrigationType: "Drip Irrigation",
    location: {
      address: "Plot No. 123, Village Road",
      city: user?.location?.city || "Hyderabad",
      state: user?.location?.state || "Telangana",
      pincode: "500001"
    },
    crops: [
      {
        id: "1",
        name: "Rice",
        variety: "Basmati",
        plantedDate: "2024-06-15",
        expectedHarvest: "2024-10-15",
        area: "2.0",
        status: "Growing"
      },
      {
        id: "2",
        name: "Wheat",
        variety: "HD-2967",
        plantedDate: "2024-11-01",
        expectedHarvest: "2025-04-01",
        area: "1.5",
        status: "Planted"
      },
      {
        id: "3",
        name: "Cotton",
        variety: "Bt Cotton",
        plantedDate: "2024-05-01",
        expectedHarvest: "2024-12-01",
        area: "1.7",
        status: "Harvested"
      }
    ]
  });

  const [preferences, setPreferences] = useState<Preferences>({
    language: "English",
    notifications: {
      weather: true,
      cropAlerts: true,
      marketPrices: false,
      diseaseWarnings: true
    },
    units: {
      temperature: "Celsius",
      area: "Acres",
      weight: "Quintal"
    }
  });

  const [editedUser, setEditedUser] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || ""
  });

  const handleSaveProfile = () => {
    updateUser(editedUser);
    setIsEditing(false);
  };

  const handleAddCrop = () => {
    const newCrop = {
      id: Date.now().toString(),
      name: "",
      variety: "",
      plantedDate: "",
      expectedHarvest: "",
      area: "",
      status: "Planning"
    };
    setFarmDetails(prev => ({
      ...prev,
      crops: [...prev.crops, newCrop]
    }));
  };

  const handleRemoveCrop = (cropId: string) => {
    setFarmDetails(prev => ({
      ...prev,
      crops: prev.crops.filter(crop => crop.id !== cropId)
    }));
  };

  const updateCrop = (cropId: string, field: string, value: string) => {
    setFarmDetails(prev => ({
      ...prev,
      crops: prev.crops.map(crop => 
        crop.id === cropId ? { ...crop, [field]: value } : crop
      )
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "growing": return "bg-green-100 text-green-800";
      case "planted": return "bg-blue-100 text-blue-800";
      case "harvested": return "bg-gray-100 text-gray-800";
      case "planning": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Please sign in</h3>
            <p className="text-muted-foreground mb-4">You need to be signed in to view your profile</p>
            <Button onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-white border-b border-green-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600 border-green-200">
                Farmer
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 bg-white border border-green-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-600">
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="farm" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-600">
              <Crop className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Farm</span>
            </TabsTrigger>
            <TabsTrigger value="crops" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Crops</span>
            </TabsTrigger>
            <TabsTrigger value="location" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Location</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-600">
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="help" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-600">
              <HelpCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Help</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Personal Information */}
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-green-600" />
                      <span>Personal Information</span>
                    </CardTitle>
                    <CardDescription>Your account details and contact information</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={editedUser.name}
                          onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={editedUser.phone}
                          onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editedUser.email}
                          onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveProfile} size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-muted-foreground">Full Name</Label>
                        <p className="font-medium">{user.name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Phone Number</Label>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email Address</Label>
                        <p className="font-medium">{user.email || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Member Since</Label>
                        <p className="font-medium">
                          {user.signupDate ? new Date(user.signupDate).toLocaleDateString() : "Recently"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <span>Quick Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Farm Area</span>
                    <span className="font-semibold">{farmDetails.farmSize} acres</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Active Crops</span>
                    <span className="font-semibold">{farmDetails.crops.filter(c => c.status !== "Harvested").length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Predictions Made</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-semibold text-green-600">87%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-green-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Crop prediction for Rice completed</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Weather alert for next week</p>
                      <p className="text-sm text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Market price update for Cotton</p>
                      <p className="text-sm text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Farm Details Tab */}
          <TabsContent value="farm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crop className="w-5 h-5 text-green-600" />
                  <span>Farm Information</span>
                </CardTitle>
                <CardDescription>Details about your farm and agricultural practices</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="farmName">Farm Name</Label>
                  <Input
                    id="farmName"
                    value={farmDetails.farmName}
                    onChange={(e) => setFarmDetails(prev => ({ ...prev, farmName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="farmSize">Farm Size (acres)</Label>
                  <Input
                    id="farmSize"
                    value={farmDetails.farmSize}
                    onChange={(e) => setFarmDetails(prev => ({ ...prev, farmSize: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="soilType">Soil Type</Label>
                  <Select value={farmDetails.soilType} onValueChange={(value) => setFarmDetails(prev => ({ ...prev, soilType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Loamy">Loamy</SelectItem>
                      <SelectItem value="Clay">Clay</SelectItem>
                      <SelectItem value="Sandy">Sandy</SelectItem>
                      <SelectItem value="Silty">Silty</SelectItem>
                      <SelectItem value="Black Cotton">Black Cotton</SelectItem>
                      <SelectItem value="Red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="irrigationType">Irrigation Type</Label>
                  <Select value={farmDetails.irrigationType} onValueChange={(value) => setFarmDetails(prev => ({ ...prev, irrigationType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Drip Irrigation">Drip Irrigation</SelectItem>
                      <SelectItem value="Sprinkler">Sprinkler</SelectItem>
                      <SelectItem value="Flood Irrigation">Flood Irrigation</SelectItem>
                      <SelectItem value="Rain Fed">Rain Fed</SelectItem>
                      <SelectItem value="Micro Sprinkler">Micro Sprinkler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crops Tab */}
          <TabsContent value="crops" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <span>Crop Details</span>
                  </CardTitle>
                  <CardDescription>Manage your current and planned crops</CardDescription>
                </div>
                <Button onClick={handleAddCrop} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Crop
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {farmDetails.crops.map((crop) => (
                    <div key={crop.id} className="p-4 border border-green-200 rounded-lg bg-green-50/30">
                      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                        <div>
                          <Label className="text-xs text-muted-foreground">Crop Name</Label>
                          <Input
                            value={crop.name}
                            onChange={(e) => updateCrop(crop.id, "name", e.target.value)}
                            placeholder="e.g., Rice"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Variety</Label>
                          <Input
                            value={crop.variety}
                            onChange={(e) => updateCrop(crop.id, "variety", e.target.value)}
                            placeholder="e.g., Basmati"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Area (acres)</Label>
                          <Input
                            value={crop.area}
                            onChange={(e) => updateCrop(crop.id, "area", e.target.value)}
                            placeholder="2.5"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Planted Date</Label>
                          <Input
                            type="date"
                            value={crop.plantedDate}
                            onChange={(e) => updateCrop(crop.id, "plantedDate", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Expected Harvest</Label>
                          <Input
                            type="date"
                            value={crop.expectedHarvest}
                            onChange={(e) => updateCrop(crop.id, "expectedHarvest", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">Status</Label>
                            <Select value={crop.status} onValueChange={(value) => updateCrop(crop.id, "status", value)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Planning">Planning</SelectItem>
                                <SelectItem value="Planted">Planted</SelectItem>
                                <SelectItem value="Growing">Growing</SelectItem>
                                <SelectItem value="Harvested">Harvested</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveCrop(crop.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge className={getStatusColor(crop.status)}>{crop.status}</Badge>
                        {crop.name && crop.variety && (
                          <p className="text-sm text-muted-foreground">
                            {crop.name} ({crop.variety}) - {crop.area} acres
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>Location & Address</span>
                </CardTitle>
                <CardDescription>Your farm location and address details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Farm Address</Label>
                  <Textarea
                    id="address"
                    value={farmDetails.location.address}
                    onChange={(e) => setFarmDetails(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, address: e.target.value }
                    }))}
                    placeholder="Enter your complete farm address"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={farmDetails.location.city}
                      onChange={(e) => setFarmDetails(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, city: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select value={farmDetails.location.state} onValueChange={(value) => setFarmDetails(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, state: value }
                    }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                        <SelectItem value="Telangana">Telangana</SelectItem>
                        <SelectItem value="Karnataka">Karnataka</SelectItem>
                        <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                        <SelectItem value="Kerala">Kerala</SelectItem>
                        <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="Gujarat">Gujarat</SelectItem>
                        <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                        <SelectItem value="Punjab">Punjab</SelectItem>
                        <SelectItem value="Haryana">Haryana</SelectItem>
                        <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                        <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                        <SelectItem value="West Bengal">West Bengal</SelectItem>
                        <SelectItem value="Bihar">Bihar</SelectItem>
                        <SelectItem value="Odisha">Odisha</SelectItem>
                        <SelectItem value="Assam">Assam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pincode">PIN Code</Label>
                    <Input
                      id="pincode"
                      value={farmDetails.location.pincode}
                      onChange={(e) => setFarmDetails(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, pincode: e.target.value }
                      }))}
                      placeholder="500001"
                    />
                  </div>
                </div>
                
                {user.location && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Current Location (GPS)</h4>
                    <div className="grid gap-2 md:grid-cols-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">City:</span> {user.location.city}
                      </div>
                      <div>
                        <span className="text-muted-foreground">State:</span> {user.location.state}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Latitude:</span> {user.location.latitude.toFixed(4)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Longitude:</span> {user.location.longitude.toFixed(4)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-green-600" />
                    <span>Notifications</span>
                  </CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weather Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified about weather changes</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.weather}
                      onCheckedChange={(checked) => setPreferences(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, weather: checked }
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Crop Alerts</Label>
                      <p className="text-sm text-muted-foreground">Crop-related notifications and reminders</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.cropAlerts}
                      onCheckedChange={(checked) => setPreferences(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, cropAlerts: checked }
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Market Prices</Label>
                      <p className="text-sm text-muted-foreground">Daily market price updates</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.marketPrices}
                      onCheckedChange={(checked) => setPreferences(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, marketPrices: checked }
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Disease Warnings</Label>
                      <p className="text-sm text-muted-foreground">Alerts about crop diseases in your area</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.diseaseWarnings}
                      onCheckedChange={(checked) => setPreferences(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, diseaseWarnings: checked }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Unit Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-green-600" />
                    <span>Unit Preferences</span>
                  </CardTitle>
                  <CardDescription>Choose your preferred units of measurement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Temperature</Label>
                    <Select value={preferences.units.temperature} onValueChange={(value) => setPreferences(prev => ({
                      ...prev,
                      units: { ...prev.units, temperature: value }
                    }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Celsius">Celsius (°C)</SelectItem>
                        <SelectItem value="Fahrenheit">Fahrenheit (°F)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Area</Label>
                    <Select value={preferences.units.area} onValueChange={(value) => setPreferences(prev => ({
                      ...prev,
                      units: { ...prev.units, area: value }
                    }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Acres">Acres</SelectItem>
                        <SelectItem value="Hectares">Hectares</SelectItem>
                        <SelectItem value="Bigha">Bigha</SelectItem>
                        <SelectItem value="Guntha">Guntha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Weight</Label>
                    <Select value={preferences.units.weight} onValueChange={(value) => setPreferences(prev => ({
                      ...prev,
                      units: { ...prev.units, weight: value }
                    }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Quintal">Quintal</SelectItem>
                        <SelectItem value="Kilogram">Kilogram</SelectItem>
                        <SelectItem value="Tonnes">Tonnes</SelectItem>
                        <SelectItem value="Maund">Maund</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy & Security */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>Privacy & Security</span>
                  </CardTitle>
                  <CardDescription>Manage your privacy and security settings</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Data Sharing</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Share crop data for research</Label>
                        <p className="text-sm text-muted-foreground">Help improve predictions for all farmers</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow location tracking</Label>
                        <p className="text-sm text-muted-foreground">For weather and soil data accuracy</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Account Security</h4>
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HelpCircle className="w-5 h-5 text-green-600" />
                    <span>Help & Support</span>
                  </CardTitle>
                  <CardDescription>Get help with using the platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    📚 User Guide
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    ❓ Frequently Asked Questions
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    💬 Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    🎥 Video Tutorials
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    📞 Call Support: +91-9876543210
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>App Information</CardTitle>
                  <CardDescription>About this application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-medium">1.2.3</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">Dec 15, 2024</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform</span>
                    <span className="font-medium">Web Application</span>
                  </div>
                  <Separator />
                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      Check for Updates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Feedback & Suggestions</CardTitle>
                <CardDescription>Help us improve the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Share your feedback, suggestions, or report issues..."
                  rows={4}
                />
                <Button className="w-full">
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}