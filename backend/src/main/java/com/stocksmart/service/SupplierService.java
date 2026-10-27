package com.stocksmart.service;

import com.stocksmart.dto.supplier.*;
import com.stocksmart.entity.Supplier;
import com.stocksmart.exception.*;
import com.stocksmart.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public Page<SupplierResponse> search(String search, Pageable pageable) {
        return supplierRepository.searchSuppliers(search, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public SupplierResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public SupplierResponse create(SupplierRequest req) {
        Supplier s = Supplier.builder().name(req.name()).contactPerson(req.contactPerson())
                .email(req.email()).phone(req.phone()).address(req.address())
                .city(req.city()).state(req.state()).country(req.country()).build();
        return toResponse(supplierRepository.save(s));
    }

    @Transactional
    public SupplierResponse update(Long id, SupplierRequest req) {
        Supplier s = findById(id);
        s.setName(req.name()); s.setContactPerson(req.contactPerson());
        s.setEmail(req.email()); s.setPhone(req.phone()); s.setAddress(req.address());
        s.setCity(req.city()); s.setState(req.state()); s.setCountry(req.country());
        return toResponse(supplierRepository.save(s));
    }

    @Transactional
    public void delete(Long id) {
        Supplier s = findById(id);
        s.setActive(false);
        supplierRepository.save(s);
    }

    private Supplier findById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
    }

    private SupplierResponse toResponse(Supplier s) {
        return new SupplierResponse(s.getId(), s.getName(), s.getContactPerson(), s.getEmail(),
                s.getPhone(), s.getAddress(), s.getCity(), s.getState(), s.getCountry(),
                s.getActive(), s.getCreatedAt());
    }
}
