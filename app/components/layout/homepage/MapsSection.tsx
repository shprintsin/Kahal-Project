import React from 'react';
import styles from './css/postSection.module.css';
import { FaArrowLeft, FaBook } from 'react-icons/fa';


interface Post {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  imageUrl: string;
}

interface Source {
  id: number;
  title: string;
  url: string;
}

interface PostSectionProps {
  posts: Post[];
  sources: Source[];
}

export default function MapSection({ posts, sources }: PostSectionProps) {
  return (
    <section className={styles.postSection}>

    </section>
  );
} 
