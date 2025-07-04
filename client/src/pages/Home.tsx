import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Download, Upload, Stethoscope, Heart, Pill, Brain, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppCard from "@/components/AppCard";
import FeaturedApp from "@/components/FeaturedApp";
import { App } from "@shared/schema";

