"use client";

import { useState } from "react";
import { KOREAN_CITIES } from "@/lib/saju/cities";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface BirthCitySelectProps {
  value: string;
  onChange: (city: string) => void;
}

export default function BirthCitySelect({ value, onChange }: BirthCitySelectProps) {
  const [isOverseas, setIsOverseas] = useState(false);
  const [overseasCity, setOverseasCity] = useState("");

  const handleSelectChange = (val: string) => {
    if (val === "__overseas__") {
      setIsOverseas(true);
      onChange(overseasCity || "");
    } else {
      setIsOverseas(false);
      onChange(val);
    }
  };

  const handleOverseasChange = (val: string) => {
    setOverseasCity(val);
    onChange(val);
  };

  return (
    <div>
      <Label className="text-sm font-medium text-[#191F28] mb-1.5 block">
        태어난 곳
      </Label>
      <Select
        value={isOverseas ? "__overseas__" : value || "서울"}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger className="h-12 rounded-xl border-gray-200 text-base">
          <SelectValue placeholder="도시를 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          {KOREAN_CITIES.map((city) => (
            <SelectItem key={city.name} value={city.name}>
              {city.name}
            </SelectItem>
          ))}
          <SelectItem value="__overseas__">해외</SelectItem>
        </SelectContent>
      </Select>

      {isOverseas && (
        <Input
          placeholder="도시 이름을 입력하세요 (예: Tokyo, New York)"
          value={overseasCity}
          onChange={(e) => handleOverseasChange(e.target.value)}
          className="mt-2 h-12 rounded-xl border-gray-200 text-base"
        />
      )}
    </div>
  );
}
