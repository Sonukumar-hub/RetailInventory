package com.stocksmart.service;

import com.stocksmart.dto.category.*;
import com.stocksmart.entity.Category;
import com.stocksmart.exception.*;
import com.stocksmart.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        return categoryRepository.findByActiveTrue(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        if (categoryRepository.existsByName(req.name()))
            throw new BadRequestException("Category name already exists: " + req.name());
        Category c = Category.builder().name(req.name()).description(req.description()).build();
        return toResponse(categoryRepository.save(c));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        Category c = findById(id);
        if (!c.getName().equals(req.name()) && categoryRepository.existsByName(req.name()))
            throw new BadRequestException("Category name already exists: " + req.name());
        c.setName(req.name());
        c.setDescription(req.description());
        return toResponse(categoryRepository.save(c));
    }

    @Transactional
    public void delete(Long id) {
        Category c = findById(id);
        c.setActive(false);
        categoryRepository.save(c);
    }

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    private CategoryResponse toResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getActive(), c.getCreatedAt());
    }
}
